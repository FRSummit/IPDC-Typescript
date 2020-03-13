import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import WithRender from './vhs-sale.html';
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
export default class VHSSale extends Vue {
    planOrReportTab !: null
    vhsSaleMaterialPlanData !: MaterialPlanData;
    vhsSaleMaterialData !: MaterialData;
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
        this.vhsSaleMaterialPlanData = this.unitPlan.vhsSaleMaterialPlanData;
        this.target = localStorage.getItem('dawahMaterialDistribution_vhsSaleMaterialPlanData') ? JSON.parse(localStorage.getItem('dawahMaterialDistribution_vhsSaleMaterialPlanData')!).target : this.unitPlan.vhsSaleMaterialPlanData.target;
        this.dateAndAction = localStorage.getItem('dawahMaterialDistribution_vhsSaleMaterialPlanData') ? JSON.parse(localStorage.getItem('dawahMaterialDistribution_vhsSaleMaterialPlanData')!).dateAndAction : this.unitPlan.vhsSaleMaterialPlanData.dateAndAction;
      } else if(tabActivationForPlanOrReport === 'REPORT') {
        this.unitReport = await this.unitPlanReportService.getReport(this.unitReportId);
        this.unitReportModifiedData = this.unitReport;
        const initialData = reportDataBuilder.getMemberReportData(this.unitReport);
        this.initialJson = JSON.stringify(initialData);
        this.vhsSaleMaterialData = this.unitReport.vhsSaleMaterialData;

        this.target = localStorage.getItem('dawahMaterialDistribution_vhsSaleMaterialData') ? JSON.parse(localStorage.getItem('dawahMaterialDistribution_vhsSaleMaterialData')!).target : this.unitReport.vhsSaleMaterialData.target;
        this.dateAndAction = localStorage.getItem('dawahMaterialDistribution_vhsSaleMaterialData') ? JSON.parse(localStorage.getItem('dawahMaterialDistribution_vhsSaleMaterialData')!).dateAndAction : this.unitReport.vhsSaleMaterialData.dateAndAction;
        this.actual = localStorage.getItem('dawahMaterialDistribution_vhsSaleMaterialData') ? JSON.parse(localStorage.getItem('dawahMaterialDistribution_vhsSaleMaterialData')!).actual : this.unitReport.vhsSaleMaterialData.actual;
        this.comment = localStorage.getItem('dawahMaterialDistribution_vhsSaleMaterialData') ? JSON.parse(localStorage.getItem('dawahMaterialDistribution_vhsSaleMaterialData')!).comment : this.unitReport.vhsSaleMaterialData.comment;
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
        else if(this.$store.state.reportStatus === 'Draft') 
        this.$router.push('/report-landing-plan')
        else this.$router.push('/report-landing-swip')
    }

    async onSubmit() {
      if(this.planOrReportTab === 'PLAN') {
        this.unitPlanModifiedData = await this.unitPlanReportService.getPlan(this.unitReportId);
        this.vhsSaleMaterialPlanData.target =  this.target!;
        this.vhsSaleMaterialPlanData.dateAndAction =  this.dateAndAction!;
        this.unitPlanModifiedData.vhsSaleMaterialPlanData = this.vhsSaleMaterialPlanData;
        if (this.isPlanDirty) {
          try {
              window.localStorage.setItem('signalR_connectionId', this.signalr.signalrConnection.id);
              await this.unitPlanReportService.updatePlan(this.unitPlanModifiedData.organization.id, this.unitReportId, planDataBuilder.getPlanData(this.unitPlanModifiedData));
              ons.notification.alert('Plan Updated',{title :''}); 
          } catch(error) {
            ons.notification.alert('Error',{title :''});
              return;
          }
        }
        else{
          ons.notification.alert('Nothing to change',{title :''});
        }
      } if(this.planOrReportTab === 'REPORT') {
        this.unitReportModifiedData = await this.unitPlanReportService.getReport(this.unitReportId);
        this.vhsSaleMaterialData.target =  this.target!;
        this.vhsSaleMaterialData.dateAndAction =  this.dateAndAction!;
        this.vhsSaleMaterialData.actual =  this.actual!;
        this.vhsSaleMaterialData.comment =  this.comment!;
        this.unitReportModifiedData.vhsSaleMaterialData = this.vhsSaleMaterialData;
        if (this.isReportDirty){
          try {
              window.localStorage.setItem('signalR_connectionId', this.signalr.signalrConnection.id);
              await this.unitPlanReportService.updateReport(this.unitReportModifiedData.organization.id, this.unitReportId, reportDataBuilder.getMemberReportData(this.unitReportModifiedData));
              ons.notification.alert('Report Updated',{title :''});
          } catch(error) {
            ons.notification.alert('Error',{title :''});
              return;
          }
        }
        else{
          ons.notification.alert('Nothing to change',{title :''});
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
      let tab = document.querySelectorAll('.my_tab')[3] as HTMLElement
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