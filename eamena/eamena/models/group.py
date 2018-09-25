from django.contrib.gis.db.models import GeometryField, GeoManager
from django.contrib.gis.geos import GEOSGeometry
from arches.app.search.search_engine_factory import SearchEngineFactory
from arches.app.utils.betterJSONSerializer import JSONSerializer, JSONDeserializer
from arches.app.search.elasticsearch_dsl_builder import Query, Terms, Bool, Match, Nested
from django.contrib.auth.models import Group

if not hasattr(Group, 'area'):
    geom = GeometryField()
    geom.contribute_to_class(Group, 'geom')
    objects = GeoManager()


class EamenaAuthGroup(Group):
    class Meta:
        proxy = True


def canUserAccessResource(user, resourceid, action='view'):
    """
    Should the given user be allowed to access the resource in the way given by action
    Access is determined by the user's membership of groups and the geometries associated to those groups
    user: the django user
    resourceid: the resource being accessed
    action: either 'view', or 'edit'
    """

    # Get the geometry for resource
    se = SearchEngineFactory().create()
    report_info = se.search(index='resource', id=resourceid)
    if not report_info:
        return True

    geometry = JSONSerializer().serialize(report_info['_source']['geometry'])

    if geometry is 'null':
        return True

    groups = user.groups
    if action is 'edit':
        groups = groups.filter(name__startswith="edit")
    elif action is 'delete' or action is 'export':
        groups = groups.filter(name__startswith="editplus")
    site_geom = GEOSGeometry(geometry)

    for group in groups.all():
        if group.geom:
            group_geom = GEOSGeometry(group.geom)
            if group_geom.contains(site_geom):
                return True;

    return False


def edit_group_check(user):
    return user.groups.filter(name__contains='edit')


def editplus_group_check(user):
    return user.groups.filter(name__contains='editplus')
