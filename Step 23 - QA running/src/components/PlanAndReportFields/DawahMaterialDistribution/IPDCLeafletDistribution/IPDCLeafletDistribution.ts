import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import WithRender from './ipdc-leaflet-distribution.html';
import { UnitPlanReportService } from "../../../../services/UnitPlanReportService"
import ons from 'onsenui';
import {MaterialPlanData} from "../../../../models/MaterialPlanData";
import {MaterialData} from "../../../../models/MaterialData";
import { UnitPlanViewModelDto } from "../../../../models/UnitPlanViewModelDto";
import { UnitReportViewModelDto } from "../../../../models/UnitReportViewModelDto";
import { planDataBuilder } from "../../../../PlanDataBuilder";
import { reportDataBuilder } from "../../../../ReportDataBuilder";
import { SignalrWrapper } from "../../../../signalrwrapper";

@WithRender

@Component
export default class IPDCLeafletDistribution extends Vue {
    planOrReportTab !: null
    ipdcLeafletDistributionMaterialPlanData !: MaterialPlanData;
    ipdcLeafletDistributionMaterialData !: MaterialData;
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

    progressbar !: any
    planOrReportTabStatus: any

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
            planOrReportTabStatus: null,
            target: null,
            dateAndAction: null,
            actual: null,
            comment: null,
            progressbar: false
        }
    }

    async created() {
      this.$store.state.reportStatusFromInput = 'dawah-section'
      this.planOrReportTabStatus = JSON.parse(localStorage.getItem('reportStatusDescriptionForInput')!).Status
      this.unitReportId= localStorage.getItem('planandreports_passing_unit_id')
      let tabActivationForPlanOrReport = JSON.parse(localStorage.getItem('reportingLanding_tab_activation')!).Tab
      this.planOrReportTab = tabActivationForPlanOrReport
      if(tabActivationForPlanOrReport === 'PLAN') {
        this.unitPlan = await this.unitPlanReportService.getPlan(this.unitReportId);
        const initialData = planDataBuilder.getPlanData(this.unitPlan);
        this.unitPlanModifiedData = this.unitPlan;
        this.initialJson = JSON.stringify(initialData);
        this.ipdcLeafletDistributionMaterialPlanData = this.unitPlan.ipdcLeafletDistributionMaterialPlanData;
        this.target = localStorage.getItem('dawahMaterialDistribution_ipdcLeafletDistributionMaterialPlanData') ? JSON.parse(localStorage.getItem('dawahMaterialDistribution_ipdcLeafletDistributionMaterialPlanData')!).target : this.unitPlan.ipdcLeafletDistributionMaterialPlanData.target;
        this.dateAndAction = localStorage.getItem('dawahMaterialDistribution_ipdcLeafletDistributionMaterialPlanData') ? JSON.parse(localStorage.getItem('dawahMaterialDistribution_ipdcLeafletDistributionMaterialPlanData')!).dateAndAction : this.unitPlan.ipdcLeafletDistributionMaterialPlanData.dateAndAction;
      } else if(tabActivationForPlanOrReport === 'REPORT') {
        this.unitReport = await this.unitPlanReportService.getReport(this.unitReportId);
        this.unitReportModifiedData = this.unitReport;
        const initialData = reportDataBuilder.getMemberReportData(this.unitReport);
        this.initialJson = JSON.stringify(initialData);
        this.ipdcLeafletDistributionMaterialData = this.unitReport.ipdcLeafletDistributionMaterialData;

        this.target = localStorage.getItem('dawahMaterialDistribution_ipdcLeafletDistributionMaterialData') ? JSON.parse(localStorage.getItem('dawahMaterialDistribution_ipdcLeafletDistributionMaterialData')!).target : this.unitReport.ipdcLeafletDistributionMaterialData.target;
        this.dateAndAction = localStorage.getItem('dawahMaterialDistribution_ipdcLeafletDistributionMaterialData') ? JSON.parse(localStorage.getItem('dawahMaterialDistribution_ipdcLeafletDistributionMaterialData')!).dateAndAction : this.unitReport.ipdcLeafletDistributionMaterialData.dateAndAction;
        this.actual = localStorage.getItem('dawahMaterialDistribution_ipdcLeafletDistributionMaterialData') ? JSON.parse(localStorage.getItem('dawahMaterialDistribution_ipdcLeafletDistributionMaterialData')!).actual : this.unitReport.ipdcLeafletDistributionMaterialData.actual;
        this.comment = localStorage.getItem('dawahMaterialDistribution_ipdcLeafletDistributionMaterialData') ? JSON.parse(localStorage.getItem('dawahMaterialDistribution_ipdcLeafletDistributionMaterialData')!).comment : this.unitReport.ipdcLeafletDistributionMaterialData.comment;
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
      document.querySelector('.navbar')!.classList.remove('hide')
      if(this.planOrReportTab === 'REPORT')
      this.$router.push('/report-landing-swip-report')        
      else if(this.$store.state.reportStatus === 'Draft' || JSON.parse(localStorage.getItem('reportStatusDescriptionForInput')!).Status === 'Draft') 
      this.$router.push('/report-landing-plan')
      else this.$router.push('/report-landing-swip')
    }

    async onSubmit() {
      this.progressbar = true
      if(this.planOrReportTab === 'PLAN') {
        this.unitPlanModifiedData = await this.unitPlanReportService.getPlan(this.unitReportId);
        this.ipdcLeafletDistributionMaterialPlanData.target =  this.target!;
        this.ipdcLeafletDistributionMaterialPlanData.dateAndAction =  this.dateAndAction!;
        this.unitPlanModifiedData.ipdcLeafletDistributionMaterialPlanData = this.ipdcLeafletDistributionMaterialPlanData;
        if (this.isPlanDirty()) {
          try {
              window.localStorage.setItem('signalR_connectionId', this.signalr.signalrConnection.id);
              await this.unitPlanReportService.updatePlan(this.unitPlanModifiedData.organization.id, this.unitReportId, planDataBuilder.getPlanData(this.unitPlanModifiedData));
              ons.notification.toast('Plan Updated',{ timeout: 1000, animation: 'fall' }); 
          } catch(error) {
            ons.notification.toast('Error',{ timeout: 1000, animation: 'fall' });
              return;
          }
        }
        else{
          ons.notification.toast('Nothing to change',{ timeout: 1000, animation: 'fall' });
        }
        this.progressbar = false
      } if(this.planOrReportTab === 'REPORT') {
        this.unitReportModifiedData = await this.unitPlanReportService.getReport(this.unitReportId);
        this.ipdcLeafletDistributionMaterialData.target =  this.target!;
        this.ipdcLeafletDistributionMaterialData.dateAndAction =  this.dateAndAction!;
        this.ipdcLeafletDistributionMaterialData.actual =  this.actual!;
        this.ipdcLeafletDistributionMaterialData.comment =  this.comment!;
        this.unitReportModifiedData.ipdcLeafletDistributionMaterialData = this.ipdcLeafletDistributionMaterialData;
        if (this.isReportDirty()){
          try {
              window.localStorage.setItem('signalR_connectionId', this.signalr.signalrConnection.id);
              await this.unitPlanReportService.updateReport(this.unitReportModifiedData.organization.id, this.unitReportId, reportDataBuilder.getMemberReportData(this.unitReportModifiedData));
              ons.notification.toast('Report Updated',{ timeout: 1000, animation: 'fall' });
          } catch(error) {
            ons.notification.toast('Error',{ timeout: 1000, animation: 'fall' });
              return;
          }
        }
        else{
          ons.notification.toast('Nothing to change',{ timeout: 1000, animation: 'fall' });
        }
        this.progressbar = false
      }
      // this.changeTab()
    }

    isPlanDirty() { 
      const latestJson = JSON.stringify(planDataBuilder.getPlanData(this.unitPlanModifiedData));
      if(latestJson !== this.initialJson)
      {
        this.initialJson = latestJson;
        return true;
      }
      else return false;
    }

    isReportDirty() { 
      const latestJson = JSON.stringify(reportDataBuilder.getMemberReportData(this.unitReportModifiedData));
      if(latestJson !== this.initialJson)
      {
        this.initialJson = latestJson;
        return true;
      }
      else return false;
    }
    
    changeTab() {
      let tab = document.querySelectorAll('.my_tab')[6] as HTMLElement
      tab.click()
    }

    onUnitPlanUpdated = async (id: number) => {
  }

    onUnitPlanUpdateFailed = (e: {$values: string[]}) => {
    }
    isEditable() {
      let tabActivationForPlanOrReport = JSON.parse(localStorage.getItem('reportingLanding_tab_activation')!).Tab
      if(tabActivationForPlanOrReport === 'PLAN' && (JSON.parse(localStorage.getItem('reportStatusDescriptionForInput')!).Status === 'PlanPromoted' || JSON.parse(localStorage.getItem('reportStatusDescriptionForInput')!).Status === 'Submitted')) {
        return true
      } else if (tabActivationForPlanOrReport === 'REPORT' && JSON.parse(localStorage.getItem('reportStatusDescriptionForInput')!).Status === 'Submitted') {
        return true
      }
    }
    planOrReportTabStatusCreate(status: any) {
      if(status === 'Draft' && this.planOrReportTab === 'PLAN') return  "Edit Plan";
      else if(status === 'PlanPromoted' && this.planOrReportTab === 'PLAN') return  "View Plan";
      else if(status === 'PlanPromoted' && this.planOrReportTab === 'REPORT') return  "Edit Report";
      else if(status === 'Submitted' && this.planOrReportTab === 'PLAN') return  "View Plan";
      else if(status === 'Submitted' && this.planOrReportTab === 'REPORT') return  "View Report";
      else return '';
    }
    nextBtn() {
      let tab = document.querySelectorAll('.my_tab')[6] as HTMLElement
      this.$router.replace('/plan-and-report-edit/dawah-material-distribution/other-sale')
      tab.click()
    }
    previousBtn() {
      let tab = document.querySelectorAll('.my_tab')[4] as HTMLElement
      this.$router.replace('/plan-and-report-edit/dawah-material-distribution/email-distribution')
      tab.click()
    }
    mounted() {
      if(document.querySelector('.navbar')) {
        let navbar = document.querySelector('.navbar') as HTMLElement
        navbar.classList.add('hide')
      }
    }
}