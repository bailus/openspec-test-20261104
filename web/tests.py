from django.test import TestCase


class IndexPageTests(TestCase):
    def get_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        return response.content.decode()

    def test_page_metadata(self):
        html = self.get_page()
        self.assertIn('<title>Vibe-tac-slop</title>', html)
        self.assertIn('rel="icon"', html)
        self.assertIn('/static/favicon.svg', html)
        self.assertIn('<div id="root"></div>', html)

    def test_theme_script_runs_before_app_modules(self):
        html = self.get_page()
        theme = html.index("localStorage.getItem('theme')")
        self.assertLess(theme, html.index('type="module"'))

    def test_dev_mode_loads_modules_from_vite_server(self):
        html = self.get_page()
        self.assertIn('http://localhost:5173/static/@vite/client', html)
        self.assertIn('http://localhost:5173/static/src/main.tsx', html)
