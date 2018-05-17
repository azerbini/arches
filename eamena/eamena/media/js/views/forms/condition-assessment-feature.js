define(['jquery', 
    'underscore', 
    'knockout',
    'views/forms/wizard-base', 
    'views/forms/sections/branch-list',
    'views/forms/sections/validation',
    'bootstrap-datetimepicker',
    'summernote'], function ($, _, ko, WizardBase, BranchList, ValidationTools, datetimepicker, summernote) {
    var vt = new ValidationTools;
    return WizardBase.extend({
        initialize: function() {
            WizardBase.prototype.initialize.apply(this);

            var self = this;
            var date_picker = $('.datetimepicker').datetimepicker({pickTime: false});            
            var currentEditedBranch = this.getBlankFormData();
            console.log(currentEditedBranch);

            date_picker.on('dp.change', function(evt){
                $(this).find('input').trigger('change'); 
            });

            this.editAssessment = function(branchlist){
                self.switchBranchForEdit(branchlist);
            }

            this.deleteAssessment = function(branchlist){
                self.deleteClicked(branchlist);
            }

            ko.applyBindings(this, this.$el.find('#existing-assessments')[0]);
    
            this.addBranchList(new BranchList({
                data: currentEditedBranch,
                dataKey: 'CONDITION_ASSESSMENT.E14'
            }));
            
            // step 1
            this.addBranchList(new BranchList({
                el: this.$el.find('#disturbances-section')[0],
                data: currentEditedBranch,
                dataKey: 'DAMAGE_STATE.E3',
                validateBranch: function (nodes) {
                    var ck0 = vt.isValidDate(nodes,"DISTURBANCE_DATE_TO.E61");
                    var ck1 = vt.isValidDate(nodes,"DISTURBANCE_DATE_FROM.E61");
                    var ck2 = vt.isValidDate(nodes,"DISTURBANCE_DATE_OCCURRED_ON.E61");
                    var ck3 = vt.isValidDate(nodes,"DISTURBANCE_DATE_OCCURRED_BEFORE.E61");
                    return ck0 && ck1 && ck2 && ck3
                }
            }));
            this.addBranchList(new BranchList({
                el: this.$el.find('#damage-severity-section')[0],
                data: currentEditedBranch,
                dataKey: 'OVERALL_DAMAGE_SEVERITY_TYPE.E55',
                validateBranch: function (nodes) {
                    return this.validateHasValues(nodes);
                }
            }));
            this.addBranchList(new BranchList({
                el: this.$el.find('#damage-extent-section')[0],
                data: currentEditedBranch,
                dataKey: 'DAMAGE_EXTENT_TYPE.E55',
                validateBranch: function (nodes) {
                    return this.validateHasValues(nodes);
                }
            }));
            this.addBranchList(new BranchList({
                el: this.$el.find('#recommendation-section')[0],
                data: currentEditedBranch,
                dataKey: 'RECOMMENDATION_PLAN.E100',
                validateBranch: function (nodes) {
                    return this.validateHasValues(nodes);
                }
            }));
            
            // step 2
            this.addBranchList(new BranchList({
                el: this.$el.find('#potential-section')[0],
                data: currentEditedBranch,
                dataKey: 'POTENTIAL_STATE_PREDICTION.XX1',
                validateBranch: function (nodes) {
                   return true
                }
            }));
            this.addBranchList(new BranchList({
                el: this.$el.find('#risk-plan-section')[0],
                data: currentEditedBranch,
                dataKey: 'RISK_PLAN.E100',
                validateBranch: function (nodes) {
                    return this.validateHasValues(nodes);
                }
            }));
            
            // step 3
            this.addBranchList(new BranchList({
                el: this.$el.find('#condition-section')[0],
                data: currentEditedBranch,
                dataKey: 'OVERALL_CONDITION_TYPE.E55',
                validateBranch: function (nodes) {
                    return this.validateHasValues(nodes);
                },
            }));
            this.addBranchList(new BranchList({
                el: this.$el.find('#priority-section')[0],
                data: currentEditedBranch,
                dataKey: 'OVERALL_PRIORITY_TYPE.E55',
                validateBranch: function (nodes) {
                    return this.validateHasValues(nodes);
                },
            }));
            this.addBranchList(new BranchList({
                el: this.$el.find('#next-assessment-date-section')[0],
                data: currentEditedBranch,
                dataKey: 'NEXT_ASSESSMENT_DATE_TYPE.E55',
                validateBranch: function (nodes) {
                    return this.validateHasValues(nodes);
                }
            }));
            this.addBranchList(new BranchList({
                el: this.$el.find('#remarks-section')[0],
                data: currentEditedBranch,
                dataKey: 'CONDITION_REMARKS_ASSIGNMENT.E13',
                validateBranch: function (nodes) {
                    return this.validateHasValues(nodes);
                }
            }));
            
            this.listenTo(this,'change', this.dateEdit)
            
            this.events['click .disturbance-date-item'] = 'showDate';
            this.events['click .disturbance-date-edit'] = 'dateEdit';
        },
        
        dateEdit: function (e, b) {
            _.each(b.nodes(), function (node) {
                if (node.entitytypeid() == 'DISTURBANCE_DATE_FROM.E61' && node.value() && node.value() != '') {
                    $('.div-date').addClass('hidden')
                    $('.div-date-from-to').removeClass('hidden')
                    $('.disturbance-date-value').html('From-To')
                } else if (node.entitytypeid() == 'DISTURBANCE_DATE_OCCURRED_ON.E61' && node.value() && node.value() != '') {
                    $('.div-date').addClass('hidden')
                    $('.div-date-on').removeClass('hidden')
                    $('.disturbance-date-value').html('On')
                } else if (node.entitytypeid() == 'DISTURBANCE_DATE_OCCURRED_BEFORE.E61' && node.value() && node.value() != '') {
                    $('.div-date').addClass('hidden')
                    $('.div-date-before').removeClass('hidden')
                    $('.disturbance-date-value').html('Before')
                }
            })
        },
        
        showDate: function (e) {
            $('.div-date').addClass('hidden')
            $('.disturbance-date-value').html($(e.target).html())
            if ($(e.target).hasClass("disturbance-date-from-to")) {
                $('.div-date-from-to').removeClass('hidden')
            } else if ($(e.target).hasClass("disturbance-date-on")) {
                $('.div-date-on').removeClass('hidden')
            } else if ($(e.target).hasClass("disturbance-date-before")) {
                $('.div-date-before').removeClass('hidden')
            }
        },

        startWorkflow: function() { 
            this.switchBranchForEdit(this.getBlankFormData());
        },

        switchBranchForEdit: function(branchData){
            this.prepareData(branchData);

            _.each(this.branchLists, function(branchlist){
                branchlist.data = branchData;
                branchlist.undoAllEdits();
            }, this);

            this.toggleEditor();
        },

        prepareData: function(assessmentNode){
            _.each(assessmentNode, function(value, key, list){
                assessmentNode[key].domains = this.data.domains;
            }, this);
            return assessmentNode;
        },

        getBlankFormData: function(){
            return this.prepareData({
                'CONDITION_ASSESSMENT.E14': {
                    'branch_lists':[]
                },
                
                // step 1
                'DAMAGE_STATE.E3': {
                    'branch_lists':[]
                },
                'OVERALL_DAMAGE_SEVERITY_TYPE.E55': {
                    'branch_lists':[]
                },
                'DAMAGE_EXTENT_TYPE.E55': {
                    'branch_lists':[]
                },
                'RECOMMENDATION_PLAN.E100': {
                    'branch_lists':[]
                },
                
                // step 2
                'POTENTIAL_STATE_PREDICTION.XX1': {
                    'branch_lists':[]
                },
                'RISK_PLAN.E100': {
                    'branch_lists':[]
                },
                
                // step 3
                'OVERALL_CONDITION_TYPE.E55': {
                    'branch_lists':[]
                },
                'OVERALL_PRIORITY_TYPE.E55': {
                    'branch_lists':[]
                },
                'NEXT_ASSESSMENT_DATE_TYPE.E55': {
                    'branch_lists':[]
                },
                'CONDITION_REMARKS_ASSIGNMENT.E13': {
                    'branch_lists':[]
                },
            })
        },

        deleteClicked: function(branchlist) {
            var warningtext = '';

            this.deleted_assessment = branchlist;
            this.confirm_delete_modal = this.$el.find('.confirm-delete-modal');
            this.confirm_delete_modal_yes = this.confirm_delete_modal.find('.confirm-delete-yes');
            this.confirm_delete_modal_yes.removeAttr('disabled');

            warningtext = this.confirm_delete_modal.find('.modal-body [name="warning-text"]').text();
            this.confirm_delete_modal.find('.modal-body [name="warning-text"]').text(warningtext + ' ' + branchlist['OVERALL_DAMAGE_SEVERITY_TYPE.E55'].branch_lists[0].nodes[0].label);           
            this.confirm_delete_modal.modal('show');
        },

    });
});
