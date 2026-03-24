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
    description = fields.Text(string='Description', readonly=True)
    category = fields.Char(string='Category', readonly=True)
    creator = fields.Char(string='Created By', readonly=True)
    is_public = fields.Boolean(string='Is Public', readonly=True)
    tags = fields.Char(string='Tags', readonly=True)
    total_items = fields.Integer(string='Total Items', readonly=True)
    oldest_item = fields.Date(string='Oldest Item Date', readonly=True)
    avg_likes = fields.Float(string='Avg Likes', readonly=True, digits=(12, 2))
    total_likes = fields.Integer(string='Total Likes', readonly=True)
    top_contributor = fields.Char(string='Top Author', readonly=True)
    most_popular_item = fields.Char(string='Most Popular Item', readonly=True)
    last_added_item = fields.Char(string='Last Added Item', readonly=True)
    sync_date = fields.Datetime(string='Last Sync', readonly=True)

    def action_import_from_api(self):
        self.ensure_one()
        url = f"https://inventory-management-app-btfvdkc4ananaggy.canadacentral-01.azurewebsites.net/api/external/aggregate/{self.api_token}"
        
        try:
            response = requests.get(url, timeout=20)
            if response.status_code == 200:
                data = response.json()
                self.write({
                    'name': data.get('title'),
                    'description': data.get('description'),
                    'category': data.get('categoryName'),
                    'creator': data.get('creator'),
                    'is_public': data.get('isPublic'),
                    'tags': data.get('tags'),
                    'total_items': data.get('totalItems'),
                    'oldest_item': data.get('oldestDate'),
                    'total_likes': data.get('totalLikes'),
                    'avg_likes': data.get('avgLikes'),
                    'top_contributor': data.get('topContributor'),
                    'most_popular_item': data.get('mostPopularItem'),
                    'last_added_item': data.get('lastAddedItem'),
                    'sync_date': fields.Datetime.now(),
                })
            else:
                raise UserError(f"API Error: {response.status_code}")
        except Exception as e:
            raise UserError(f"Connection failed: {e}")