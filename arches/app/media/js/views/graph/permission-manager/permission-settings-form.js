define([
    'backbone',
    'knockout',
], function(Backbone,  ko) {
    var PermissionSettingsForm = Backbone.View.extend({
        /**
        * A backbone view representing a card component form
        * @augments Backbone.View
        * @constructor
        * @name PermissionSettingsForm
        */

        /**
        * Initializes the view with optional parameters
        * @memberof PermissionSettingsForm.prototype
        * @param {boolean} options.selection - the selected item, either a {@link CardModel} or a {@link NodeModel}
        */
        initialize: function(options) {

            this.selectedUsersAndGroups = options.selectedUsersAndGroups;
            this.selectedCards = options.selectedCards;



            options.nodegroupPermissions.forEach(function(perm){
                perm.selected = ko.observable(false);
            })
            this.nodegroupPermissions = ko.observableArray(options.nodegroupPermissions);

            // var self = this;
            // _.extend(this, _.pick(options, 'card'));
            // this.selection = options.selection || ko.observable(this.card);
            // this.helpPreviewActive = options.helpPreviewActive || ko.observable(false);
            // this.card = ko.observable();
            // this.widget = ko.observable();
            // this.graph = options.graphModel;
            // this.widgetLookup = widgets;
            // this.widgetList = function() {
            //     var cardWidget = self.widget();
            //     if (cardWidget) {
            //         var widgets = _.map(self.widgetLookup, function(widget, id) {
            //             widget.id = id;
            //             return widget;
            //         });
            //         return _.filter(widgets, function(widget) {
            //             return widget.datatype === cardWidget.datatype.datatype
            //         });
            //     } else {
            //         return [];
            //     }
            // };

            // this.updateSelection = function(selection) {
            //     if('isContainer' in selection){
            //         this.card(selection);
            //     }
            //     if('node' in selection){
            //         this.widget(selection);
            //     }
            // };

            // this.selection.subscribe(function (selection) {
            //     this.helpPreviewActive(false);
            //     this.updateSelection(selection);
            // }, this);

            // this.updateSelection(this.selection());

            // this.permissionsList = new PermissionsList({
            //     card: this.card,
            //     permissions: options.permissions
            // });
        }
    });
    return PermissionSettingsForm;
});
