'''
ARCHES - a program developed to inventory and manage immovable cultural heritage.
Copyright (C) 2013 J. Paul Getty Trust and World Monuments Fund

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
'''
import re
import uuid
from django.utils import translation
from arches.app.views.concept import get_preflabel_from_valueid
from arches.app.models.entity import Entity
from django.utils.translation import ugettext as _
from django.conf import settings

class ResourceForm(object):
    def __init__(self, resource):
        # here is where we can create the basic format for the form data
        info = self.get_info()
        self.id = info['id']
        self.name = info['name']
        self.icon = info['icon']
        self.resource = resource
        self.data = {}
        
        if resource.entityid and settings.DEBUG:
            import os, json
            from arches.app.search.search_engine_factory import SearchEngineFactory
            se = SearchEngineFactory().create()
            report_info = se.search(index='resource', id=resource.entityid)
            with open(os.path.join(settings.PACKAGE_ROOT,'logs','current_graph.json'),'wb') as out:
                json.dump(report_info['_source']['graph'],out,indent=1)

    @property
    def schema(self):
        try:
            return self._schema
        except AttributeError:
            self._schema = Entity.get_mapping_schema(self.resource.entitytypeid)
            return self._schema
            
    @schema.setter
    def schema(self, value):
        self._schema = value
    @staticmethod
    def get_info():
        return {
            'id': '',
            'icon': '',
            'name': '',
            'class': ResourceForm
        }

    def update(self, data, files):
        # update resource w/ post data
        return 

    def load(self, lang):
        # retrieves the data from the server
        return 

    def get_nodes(self, entitytypeid):

        #return self.resource.get_nodes(entitytypeid, keys=['label', 'value', 'entityid', 'entitytypeid'])
        ret = []
        prefLabel  = {}
        entities = self.resource.find_entities_by_type_id(entitytypeid)
        uuid_regex = re.compile('[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}')
        for entity in entities:
            
            flattened = []
            # Iterates through every branch (with its child nodes) to substitute the default label with the desired prefLabel
            for flattenedvalue in entity.flatten():
                # Makes sure that only the visualisation of concepts is altered: free text and geometric data are not
                if isinstance(flattenedvalue.value, basestring) and uuid_regex.match(flattenedvalue.value):
                    # Retrieves the concept label in the correct language
                    prefLabel = get_preflabel_from_valueid(flattenedvalue.value, lang=translation.get_language())
                    flattenedvalue.label = prefLabel['value']
                    flattenedvalue.value = prefLabel['id']

                flattened.append(flattenedvalue)
            
            ret.append({'nodes': flattened})
        return ret

    def update_nodes(self, entitytypeid, data, dataKey=None):
        
        if dataKey == None:
            dataKey = entitytypeid

        self.resource.prune(entitytypes=[entitytypeid])

        if self.schema == None:
            self.schema = Entity.get_mapping_schema(self.resource.entitytypeid)
        for value in data[entitytypeid]:
            baseentity = None
            for newentity in value['nodes']:
                if type(newentity) is list:
                    for newentityitem in newentity:
                        baseentitygroup = None
                        for newsubentity in newentityitem:
                            entity = Entity()
                            if newsubentity['entitytypeid'] in self.schema:
                                entity.create_from_mapping(self.resource.entitytypeid, self.schema[newsubentity['entitytypeid']]['steps'], newsubentity['entitytypeid'], newsubentity['value'], '')
                                if baseentitygroup == None:
                                    baseentitygroup = entity
                                else:
                                    baseentitygroup.merge(entity)
                        
                        if baseentity == None:
                            baseentity = baseentitygroup
                        else:
                            baseentity.merge_at(baseentitygroup, entitytypeid)
                            

                else:
                    entity = Entity()
                    if newentity['entitytypeid'] in self.schema:
                        entity.create_from_mapping(self.resource.entitytypeid, self.schema[newentity['entitytypeid']]['steps'], newentity['entitytypeid'], newentity['value'], '')
                        if baseentity == None:
                            baseentity = entity
                        else:
                            baseentity.merge(entity)
            
            self.resource.merge_at(baseentity, self.resource.entitytypeid)

        self.resource.trim()

    def set_user(self, user):
        self.user = user


class DeleteResourceForm(ResourceForm):
    @staticmethod
    def get_info():
        return {
            'id': 'delete-resource',
            'icon': 'fa-times-circle',
            'name': _('Delete Resource'),
            'class': DeleteResourceForm
        }