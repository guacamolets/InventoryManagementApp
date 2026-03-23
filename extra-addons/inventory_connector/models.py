import requests
import logging
from odoo import models, fields, api
from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)

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
        self.ensure_one()
        base_url = "https://inventory-management-app-btfvdkc4ananaggy.canadacentral-01.azurewebsites.net"
        url = f"{base_url}/api/external/aggregate/{self.api_token}"
        
        try:
            response = requests.get(url, timeout=20)
            
            if response.status_code == 200:
                data = response.json()
                stats = data.get('stats', [])

                dates_info = next((s for s in stats if s.get('title') == 'Creation Dates'), {})
                likes_info = next((s for s in stats if s.get('title') == 'Engagement (Likes)'), {})
                users_info = next((s for s in stats if s.get('title') == 'Top Contributors'), {})

                top_users = users_info.get('topUsers', [])
                first_user = top_users[0].get('user') if top_users else "No data"

                self.write({
                    'name': data.get('title'),
                    'oldest_item': dates_info.get('oldest'),
                    'total_likes': likes_info.get('totalLikes', 0),
                    'avg_likes': likes_info.get('avgLikesPerItem', 0),
                    'top_contributor': first_user
                })
            else:
                raise UserError(f"API returned an error: {response.status_code}")
                
        except Exception as e:
            _logger.error(f"Azure Import Error: {str(e)}")
            raise UserError(f"Communication error: {e}")