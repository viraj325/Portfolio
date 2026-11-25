import unittest
from update_company_overviews import latest_assets, parse_aum, parse_fleet, period_fact


class OverviewTests(unittest.TestCase):
    def test_quarterly_income_never_uses_ytd_or_future_filings(self):
        facts = [dict(start='2026-01-01', end='2026-09-30', filed='2026-11-01', val=17, form='10-Q'),
                 dict(start='2026-07-01', end='2026-09-30', filed='2026-11-01', val=6, form='10-Q'),
                 dict(start='2026-07-01', end='2026-09-30', filed='2027-01-01', val=9, form='10-Q')]
        payload = {'facts': {'us-gaap': {'NetIncomeLoss': {'units': {'USD': facts}}}}}
        self.assertEqual(period_fact(payload, 'NetIncomeLoss', '2026-09-30', '2026-11-25', True)['val'], 6)
        facts.pop(1)
        with self.assertRaises(ValueError):
            period_fact(payload, 'NetIncomeLoss', '2026-09-30', '2026-11-25', True)

    def test_latest_assets_ignores_future_filings_and_comparative_periods(self):
        facts = [dict(end='2026-06-30', filed='2026-11-01', val=1, form='10-Q'),
                 dict(end='2026-09-30', filed='2026-11-01', val=2, form='10-Q'),
                 dict(end='2026-12-31', filed='2027-02-01', val=3, form='10-K')]
        payload = {'facts': {'us-gaap': {'Assets': {'units': {'USD': facts}}}}}
        self.assertEqual(latest_assets(payload, '2026-11-25')['val'], 2)

    def test_aum_and_client_assets_are_distinct(self):
        text = 'Assets under management were $5.2 trillion, up 13%, and client assets were $7.9 trillion.'
        self.assertEqual(parse_aum(text), [5.2, 7.9])
        with self.assertRaises(ValueError):
            parse_aum('No verified figures available')

    def test_fleet_parser_handles_rich_text_without_navigation_scripts(self):
        text = '<script>fake fleet of 10 aircraft</script><p>NetJets maintains and operates <b>1,000+</b> aircraft. Owners enjoy access to more than 5,000 airports.</p>'
        self.assertEqual(parse_fleet(text), ('1,000+', '5,000+'))
        with self.assertRaises(ValueError):
            parse_fleet('<p>Overview is not available</p>')


if __name__ == '__main__':
    unittest.main()
