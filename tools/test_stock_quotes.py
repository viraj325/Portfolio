import unittest
from unittest.mock import patch
import update_stock_quotes as updater


class StockQuoteTests(unittest.TestCase):
    def payload(self, price=123.45, previous=120):
        return {'chart': {'result': [{'meta': {'regularMarketPrice': price,
            'previousClose': previous, 'regularMarketTime': 1795550400}}]}}

    def test_price_direction_and_provider_timestamp(self):
        for price, direction in [(123.45, 'up'), (119, 'down'), (120, 'unchanged')]:
            quote = updater.parse_quote('WFC', self.payload(price))
            self.assertEqual(quote['direction'], direction)
            self.assertEqual(quote['price'], price)
            self.assertEqual(quote['asOf'], '2026-11-24T20:00:00Z')

    def test_invalid_prices_are_rejected(self):
        for price in [float('nan'), float('inf'), -1, 0, True, '123']:
            with self.assertRaises(ValueError):
                updater.parse_quote('WFC', self.payload(price))

    def test_unknown_previous_close_does_not_invent_a_gain(self):
        quote = updater.parse_quote('WFC', self.payload(previous=None))
        self.assertEqual(quote['direction'], 'unchanged')

    def test_failed_fetch_preserves_existing_snapshot(self):
        with patch.object(updater, 'fetch_quote', side_effect=RuntimeError('offline')):
            with patch('pathlib.Path.write_text') as write:
                with self.assertRaises(RuntimeError):
                    updater.main()
                write.assert_not_called()


if __name__ == '__main__':
    unittest.main()
