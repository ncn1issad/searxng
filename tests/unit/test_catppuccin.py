# SPDX-License-Identifier: AGPL-3.0-or-later
"""Catppuccin preference saving and legacy style compatibility."""

import unittest

from lxml import html

from tests.unit import test_webapp


class CatppuccinTestCase(unittest.TestCase):
    def setUp(self):
        case = test_webapp.ViewsTestCase('test_preferences')
        case.setUp()
        self.addCleanup(case.doCleanups)
        self.client = case.client

    def test_saved_flavors(self):
        for flavor in ('mocha', 'latte', 'frappe', 'macchiato'):
            with self.subTest(flavor=flavor):
                response = self.client.post('/preferences', data={'theme': 'simple', 'simple_style': flavor})
                self.assertEqual(response.status_code, 302)
                page = html.fromstring(self.client.get('/preferences').data)
                self.assertIn('theme-' + flavor, page.get('class').split())
                self.assertEqual(page.xpath('//select[@name="theme"]/option[@selected]/text()'), ['Catppuccin'])
                self.assertEqual(page.xpath('//select[@name="simple_style"]/option/@value'),
                                 ['mocha', 'latte', 'frappe', 'macchiato'])
                self.assertEqual(page.xpath('//select[@name="simple_style"]/option[@selected]/@value'), [flavor])
                for route in ('/', '/search?q=elephant'):
                    result = self.client.get(route)
                    self.assertEqual(result.status_code, 200)
                    self.assertIn('theme-' + flavor, html.fromstring(result.data).get('class').split())

    def test_legacy_flavors(self):
        for legacy, flavor in (('light', 'latte'), ('dark', 'mocha'), ('black', 'mocha'), ('auto', 'mocha')):
            with self.subTest(legacy=legacy):
                self.client.set_cookie('simple_style', legacy)
                page = html.fromstring(self.client.get('/preferences').data)
                self.assertIn('theme-' + flavor, page.get('class').split())
                self.assertEqual(page.xpath('//select[@name="simple_style"]/option[@selected]/@value'), [flavor])
