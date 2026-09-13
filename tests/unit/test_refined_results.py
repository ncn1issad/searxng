# SPDX-License-Identifier: AGPL-3.0-or-later
"""Category routing and optional metadata in the personal search templates."""

import unittest
from datetime import datetime, timezone
from unittest.mock import Mock, patch

import babel
from lxml import html

import searx.search
from searx.result_types._base import LegacyResult
from searx.search.models import EngineRef
from tests.unit import test_webapp


class RefinedResultsTestCase(unittest.TestCase):
    def setUp(self):
        self.webapp_case = test_webapp.ViewsTestCase('test_search_html')
        self.webapp_case.setUp()
        self.addCleanup(self.webapp_case.doCleanups)
        self.client = self.webapp_case.client

    def render_results(self, categories, rows):
        results = []
        for row in rows:
            result = LegacyResult(
                {
                    'title': 'Elephant result',
                    'url': 'https://example.org/item',
                    'engine': 'dummy engine',
                    'template': 'default.html',
                    'content': 'A description of elephants.',
                    **row,
                }
            )
            result.normalize_result_fields()
            results.append(result)

        def search_mock(search_self, *_args):
            search_self.search_query.engineref_list = [EngineRef('dummy engine', c) for c in categories]
            search_self.search_query.locale = babel.Locale.parse('en-US', sep='-')
            search_self.result_container = Mock(
                get_ordered_results=lambda: results,
                answers={},
                corrections=set(),
                suggestions=set(),
                infoboxes=[],
                unresponsive_engines=set(),
                results=results,
                results_length=lambda: len(results),
                get_timings=lambda: [],
                redirect_url=None,
                engine_data={},
            )

        with patch.object(searx.search.Search, 'search', search_mock):
            response = self.client.get('/search?q=elephants')
        self.assertEqual(response.status_code, 200)
        return html.fromstring(response.data)

    def test_it_types_and_optional_details(self):
        tree = self.render_results(['it'], [
            {'engine': 'github', 'url': 'https://github.com/elastic/client',
             'template': 'packages.html', 'package_name': 'client', 'popularity': 0},
            {'url': 'https://pypi.org/project/client/', 'template': 'packages.html',
             'package_name': 'client', 'version': '2.0',
             'source_code_url': 'https://github.com/elastic/client'},
            {'url': 'https://stackoverflow.com/questions/123', 'content': 'Existing Q&A summary'},
            {},
        ])
        rows = tree.cssselect('[data-it-type]')
        self.assertEqual([row.get('data-it-type') for row in rows], ['repo', 'package', 'qa', 'other'])
        self.assertIn('Stars: 0', rows[0].text_content())
        self.assertTrue(rows[0].cssselect('details:not([open]) summary'))
        self.assertTrue(rows[1].xpath('.//a[@href="https://github.com/elastic/client"]'))
        self.assertIn('v2.0', rows[1].text_content())
        self.assertIn('Existing Q&A summary', rows[2].text_content())
        self.assertFalse(rows[2].cssselect('details'))
        self.assertEqual(len(tree.cssselect('[data-it-filter]')), 5)
        self.assertFalse(tree.cssselect('.attributes'))
        general = self.render_results(['general'], [{'template': 'packages.html', 'package_name': 'client'}])
        self.assertFalse(general.cssselect('[data-it-type]'))
        self.assertTrue(general.cssselect('.attributes'))

    def test_dedicated_tabs_keep_media_in_the_result_list(self):
        for category, css_class in [
            ('videos', 'refined-video'),
            ('music', 'refined-track'),
            ('news', 'refined-news'),
            ('social media', 'refined-social'),
        ]:
            with self.subTest(category=category):
                tree = self.render_results(
                    [category],
                    [
                        {'thumbnail': 'https://example.org/thumb.jpg', 'iframe_src': 'https://example.org/embed'},
                        {},
                    ],
                )
                articles = tree.cssselect('#urls article')
                self.assertEqual(len(articles), 2)
                self.assertTrue(all(css_class in a.classes for a in articles))
                self.assertFalse(tree.cssselect('.opportunistic-media'))
                self.assertEqual(len(tree.cssselect('iframe[data-src]')), 1)
                self.assertFalse(tree.cssselect('iframe[src]'))

    def test_general_and_multiple_categories_keep_carousels(self):
        for categories in [['general'], ['general', 'videos']]:
            with self.subTest(categories=categories):
                tree = self.render_results(categories, [{'iframe_src': 'https://example.org/embed'}])
                self.assertTrue(tree.cssselect('.opportunistic-media'))
                self.assertFalse(tree.cssselect('#results.refined-tab'))

    def test_zero_coordinates_and_missing_coordinates(self):
        tree = self.render_results(
            ['map'],
            [
                {'template': 'map.html', 'latitude': 0, 'longitude': 0},
                {'template': 'map.html'},
            ],
        )
        places = tree.cssselect('.refined-place')
        self.assertEqual(places[0].get('data-lat'), '0')
        self.assertEqual(places[0].get('data-lon'), '0')
        self.assertIsNone(places[1].get('data-lat'))
        directions = tree.cssselect('.place-directions a')
        self.assertEqual(len(directions), 1)
        self.assertIn('to=0%2C0', directions[0].get('href'))

    def test_science_abstract_and_pdf_are_preserved(self):
        tree = self.render_results(
            ['science'],
            [
                {
                    'template': 'paper.html',
                    'pdf_url': 'https://example.org/paper.pdf',
                    'doi': '10.1000/example',
                    'authors': ['A. Researcher'],
                }
            ],
        )
        self.assertTrue(tree.cssselect('details.paper-abstract'))
        self.assertTrue(tree.xpath('//a[@href="https://example.org/paper.pdf"]'))
        self.assertIn('A. Researcher', tree.text_content())

    def test_torrent_zero_seed_and_magnet_link(self):
        tree = self.render_results(
            ['files'],
            [
                {
                    'template': 'torrent.html',
                    'seed': 0,
                    'leech': 0,
                    'magnetlink': 'magnet:?xt=urn:btih:0123456789abcdef0123456789abcdef01234567',
                }
            ],
        )
        self.assertIn('0', tree.cssselect('.seeds-count')[0].text_content())
        self.assertTrue(tree.cssselect('a.magnetlink'))

    def test_empty_tabs_do_not_create_media_controls(self):
        for category in ['videos', 'map', 'music', 'news', 'it', 'science', 'files', 'social media']:
            with self.subTest(category=category):
                tree = self.render_results([category], [])
                self.assertFalse(tree.cssselect('.refined-media-button, #refined-map, [data-video-view]'))

    def test_news_dates_have_a_compact_label_and_machine_readable_value(self):
        tree = self.render_results(['news'], [{'publishedDate': datetime(2026, 9, 9, tzinfo=timezone.utc)}])
        date = tree.cssselect('.refined-news time')[0]
        self.assertEqual(date.text, '2026-09-09')
        self.assertEqual(date.get('datetime'), '2026-09-09T00:00:00+00:00')
