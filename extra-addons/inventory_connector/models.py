import requests
from odoo import models, fields, api
from odoo.exceptions import UserError

class ExternalInventory(models.Model):
    _name = 'external.inventory'
    _description = 'Inventory Data from C# App'

    name = fields.Char(string='Inventory Title', readonly=True)
    api_token = fields.Char(string='API Token', required=True)
    oldest_item = fields.Date(string='The oldest item', readonly=True)
    avg_likes = fields.Float(string='Average number of likes', readonly=True)
    total_likes = fields.Integer(string='Total likes', readonly=True)
    top_contributor = fields.Char(string='Top author', readonly=True)

    def action_import_from_api(self):
        url = f"http://host.docker.internal:5000/api/external/aggregate/{self.api_token}"
        
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                fields_data = data.get('fields', [])

                dates_stats = next((f for f in fields_data if f['title'] == 'Creation Dates'), {})
                likes_stats = next((f for f in fields_data if f['title'] == 'Engagement (Likes)'), {})
                user_stats = next((f for f in fields_data if f['title'] == 'Top Contributors'), {})
                
                top_user = user_stats.get('topUsers', [{}])[0].get('user', 'N/A')

                self.write({
                    'name': data.get('inventoryTitle'),
                    'oldest_item': dates_stats.get('oldest'),
                    'avg_likes': likes_stats.get('avgLikesPerItem', 0),
                    'total_likes': likes_stats.get('totalLikes', 0),
                    'top_contributor': top_user
                })
            else:
                raise UserError(f"API returned an error: {response.status_code}")
        except Exception as e:
            raise UserError(f"Communication error: {str(e)}")