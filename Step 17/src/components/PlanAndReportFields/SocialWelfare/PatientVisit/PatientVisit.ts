import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import WithRender from './patient-visit.html';
import { UnitPlanReportService } from "../../../../services/UnitPlanReportService"
import ons from 'onsenui';
import {SocialWelfarePlanData} from "../../../../models/SocialWelfarePlanData";
import {SocialWelfareData} from "../../../../models/SocialWelfareData";
import { UnitPlanViewModelDto } from "../../../../models/UnitPlanViewModelDto";
import { UnitReportViewModelDto } from "../../../../models/UnitReportViewModelDto";
import { planDataBuilder } from "../../../../PlanDataBuilder";
import { reportDataBuilder } from "../../../../ReportDataBuilder";
import { SignalrWrapper } from "../../../../signalrwrapper";

@WithRender

@Component
export default class PatientVisit extends Vue {
    planOrReportTab !: null
    patientVisitSocialWelfarePlanData !: SocialWelfarePlanData;
    patientVisitSocialWelfareData !: SocialWelfareData;
    unitPlan !: UnitPlanViewModelDto;
    unitPlanModifiedData !: UnitPlanViewModelDto;
    unitReportModifiedData !: UnitReportViewModelDto;
    unitReport !: UnitReportViewModelDto;
    signalreventhandlers: any = {};
    unitReportId:any;
    initialJson = "";
    target !: null
    dateAndAction !: null
    actual !: null
    comment !: null
    signalr = new SignalrWrapper();
    unitPlanReportService = new UnitPlanReportService();

    constructor() 
    { 
        super()
        this.signalreventhandlers = {
            "UnitPlanUpdated": this.onUnitPlanUpdated,
            "UnitPlanUpdateFailed": this.onUnitPlanUpdateFailed,
        };
    }
    data() {
        return {
            planOrReportTab: null,
            target: null,
            dateAndAction: null,
            actual: null,
            comment: null,
        }
    }
    async created() {
      this.unitReportId= localStorage.getItem('planandreports_passing_unit_id')
      let tabActivationForPlanOrReport = JSON.parse(localStorage.getItem('reportingLanding_tab_activation')!).Tab
      this.planOrReportTab = tabActivationForPlanOrReport
      if(tabActivationForPlanOrReport === 'PLAN') {
        this.unitPlan = await this.unitPlanReportService.getPlan(this.unitReportId);
        const initialData = planDataBuilder.getPlanData(this.unitPlan);
        this.unitPlanModifiedData = this.unitPlan;
        this.initialJson = JSON.stringify(initialData);
        this.patientVisitSocialWelfarePlanData = this.unitPlan.patientVisitSocialWelfarePlanData;
        this.target = localStorage.getItem('socialWelfare_patientVisitSocialWelfarePlanData') ? JSON.parse(localStorage.getItem('socialWelfare_patientVisitSocialWelfarePlanData')!).target : this.unitPlan.patientVisitSocialWelfarePlanData.target;
        this.dateAndAction = localStorage.getItem('socialWelfare_patientVisitSocialWelfarePlanData') ? JSON.parse(localStorage.getItem('socialWelfare_patientVisitSocialWelfarePlanData')!).dateAndAction : this.unitPlan.patientVisitSocialWelfarePlanData.dateAndAction;
      } else if(tabActivationForPlanOrReport === 'REPORT') {
        this.unitReport = await this.unitPlanReportService.getReport(this.unitReportId);
        this.unitReportModifiedData = this.unitReport;
        const initialData = reportDataBuilder.getMemberReportData(this.unitReport);
        this.initialJson = JSON.stringify(initialData);
        this.patientVisitSocialWelfareData = this.unitReport.patientVisitSocialWelfareData;
        this.target = localStorage.getItem('socialWelfare_patientVisitSocialWelfareData') ? JSON.parse(localStorage.getItem('socialWelfare_patientVisitSocialWelfareData')!).target : this.unitReport.patientVisitSocialWelfareData.target;
        this.dateAndAction = localStorage.getItem('socialWelfare_patientVisitSocialWelfareData') ? JSON.parse(localStorage.getItem('socialWelfare_patientVisitSocialWelfareData')!).dateAndAction : this.unitReport.patientVisitSocialWelfareData.dateAndAction;
        this.actual = localStorage.getItem('socialWelfare_patientVisitSocialWelfareData') ? JSON.parse(localStorage.getItem('socialWelfare_patientVisitSocialWelfareData')!).actual : this.unitReport.patientVisitSocialWelfareData.actual;
        this.comment = localStorage.getItem('socialWelfare_patientVisitSocialWelfareData') ? JSON.parse(localStorage.getItem('socialWelfare_patientVisitSocialWelfareData')!).comment : this.unitReport.patientVisitSocialWelfareData.comment;
      }
      await this.signalrStart();
    }
    async signalrStart() {
      this.signalr.start();
      for (const key in this.signalreventhandlers) {
          if (this.signalreventhandlers.hasOwnProperty(key)) {
              this.signalr.on(key, this.signalreventhandlers[key]);
          }
       }
    }
    backButton() {
        if(this.planOrReportTab === 'REPORT') 
        this.$router.push('/report-landing-swip-report')        
        else if(this.unitPlan.reOpenedReportStatusDescription === 'Draft') 
        this.$router.push('/report-landing-plan')
        else this.$router.push('/report-landing-swip')
    }
    async onSubmit() {
      if(this.planOrReportTab === 'PLAN') {
        this.patientVisitSocialWelfarePlanData.target =  this.target!;
        this.patientVisitSocialWelfarePlanData.dateAndAction =  this.dateAndAction!;
      
        if (!this.isPlanDirty) return;
        try {
            window.localStorage.setItem('signalR_connectionId', this.signalr.signalrConnection.id);
            await this.unitPlanReportService.updatePlan(this.unitPlanModifiedData.organization.id, this.unitReportId, planDataBuilder.getPlanData(this.unitPlanModifiedData));
            ons.notification.alert('Plan Updated',{title :''}); 
        } catch(error) {
          ons.notification.alert('Error',{title :''});
            return;
        }
      } if(this.planOrReportTab === 'REPORT') {
        this.patientVisitSocialWelfareData.target =  this.target!;
        this.patientVisitSocialWelfareData.dateAndAction =  this.dateAndAction!;
        this.patientVisitSocialWelfareData.actual =  this.actual!;
        this.patientVisitSocialWelfareData.comment =  this.comment!;
        if (!this.isReportDirty) return;
        try {
            window.localStorage.setItem('signalR_connectionId', this.signalr.signalrConnection.id);
            await this.unitPlanReportService.updateReport(this.unitReportModifiedData.organization.id, this.unitReportId, reportDataBuilder.getMemberReportData(this.unitReportModifiedData));
            ons.notification.alert('Report Updated',{title :''});
        } catch(error) {
          ons.notification.alert('Error',{title :''});
            return;
        }
      }
      this.changeTab()
    }
    get isPlanDirty() { 
      const latestJson = JSON.stringify(planDataBuilder.getPlanData(this.unitPlanModifiedData));
      return latestJson !== this.initialJson;
    }
    get isReportDirty() { 
      const latestJson = JSON.stringify(reportDataBuilder.getMemberReportData(this.unitReportModifiedData));
      return latestJson !== this.initialJson;;
    }
    changeTab() {
      let tab = document.querySelectorAll('.my_tab')[2] as HTMLElement
      tab.click()
    }
    onUnitPlanUpdated = async (id: number) => {
    }
    onUnitPlanUpdateFailed = (e: {$values: string[]}) => {
    }
    isEditable() {
      let tabActivationForPlanOrReport = JSON.parse(localStorage.getItem('reportingLanding_tab_activation')!).Tab
      if(tabActivationForPlanOrReport === 'PLAN' && (this.$store.state.reportStatus === 'PlanPromoted' || this.$store.state.reportStatus === 'Submitted')) {
        return true
      } else if (tabActivationForPlanOrReport === 'REPORT' && this.$store.state.reportStatus === 'Submitted') {
        return true
      }
    }
}