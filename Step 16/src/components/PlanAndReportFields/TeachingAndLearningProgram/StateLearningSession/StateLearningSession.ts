import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import WithRender from './state-learning-session.html';
import { UnitPlanReportService } from "../../../../services/UnitPlanReportService"
import ons from 'onsenui';
import {TeachingLearningProgramPlanData} from "../../../../models/TeachingLearningProgramPlanData";
import {TeachingLearningProgramData} from "../../../../models/TeachingLearningProgramData";
import { UnitPlanViewModelDto } from "../../../../models/UnitPlanViewModelDto";
import { UnitReportViewModelDto } from "../../../../models/UnitReportViewModelDto";
import { planDataBuilder } from "../../../../PlanDataBuilder";
import { reportDataBuilder } from "../../../../ReportDataBuilder";
import { SignalrWrapper } from "../../../../signalrwrapper";

@WithRender

@Component
export default class StateLearningSession extends Vue {
    planOrReportTab !: null
    stateLearningSessionTeachingLearningProgramPlanData !: TeachingLearningProgramPlanData;
    stateLearningSessionTeachingLearningProgramData !: TeachingLearningProgramData;
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
    averageAttendance !: null
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
            averageAttendance: null,
            comment: null
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
        this.stateLearningSessionTeachingLearningProgramPlanData = this.unitPlan.stateLearningSessionTeachingLearningProgramPlanData;
        this.target = localStorage.getItem('teachingAndLearningProgram_stateLearningSessionTeachingLearningProgramPlanData') ? JSON.parse(localStorage.getItem('teachingAndLearningProgram_stateLearningSessionTeachingLearningProgramPlanData')!).target : this.unitPlan.stateLearningSessionTeachingLearningProgramPlanData.target;
        this.dateAndAction = localStorage.getItem('teachingAndLearningProgram_stateLearningSessionTeachingLearningProgramPlanData') ? JSON.parse(localStorage.getItem('teachingAndLearningProgram_stateLearningSessionTeachingLearningProgramPlanData')!).dateAndAction : this.unitPlan.stateLearningSessionTeachingLearningProgramPlanData.dateAndAction;
        if(this.unitPlan.reportStatusDescription === 'PlanPromoted' || this.unitPlan.reportStatusDescription === 'Submitted'){
          this.planInputReadable()
        }
      } else if(tabActivationForPlanOrReport === 'REPORT') {
        this.unitReport = await this.unitPlanReportService.getReport(this.unitReportId);
        this.unitReportModifiedData = this.unitReport;
        const initialData = reportDataBuilder.getMemberReportData(this.unitReport);
        this.initialJson = JSON.stringify(initialData);
        this.stateLearningSessionTeachingLearningProgramData = this.unitReport.stateLearningSessionTeachingLearningProgramData;
        this.target = localStorage.getItem('teachingAndLearningProgram_stateLearningSessionTeachingLearningProgramData') ? JSON.parse(localStorage.getItem('teachingAndLearningProgram_stateLearningSessionTeachingLearningProgramData')!).target : this.unitReport.stateLearningSessionTeachingLearningProgramData.target;
        this.dateAndAction = localStorage.getItem('teachingAndLearningProgram_stateLearningSessionTeachingLearningProgramData') ? JSON.parse(localStorage.getItem('teachingAndLearningProgram_stateLearningSessionTeachingLearningProgramData')!).dateAndAction : this.unitReport.stateLearningSessionTeachingLearningProgramData.dateAndAction;
        this.actual = localStorage.getItem('teachingAndLearningProgram_stateLearningSessionTeachingLearningProgramData') ? JSON.parse(localStorage.getItem('teachingAndLearningProgram_stateLearningSessionTeachingLearningProgramData')!).actual : this.unitReport.stateLearningSessionTeachingLearningProgramData.actual;
        this.averageAttendance = localStorage.getItem('teachingAndLearningProgram_stateLearningSessionTeachingLearningProgramData') ? JSON.parse(localStorage.getItem('teachingAndLearningProgram_stateLearningSessionTeachingLearningProgramData')!).averageAttendance : this.unitReport.stateLearningSessionTeachingLearningProgramData.averageAttendance;
        this.comment = localStorage.getItem('teachingAndLearningProgram_stateLearningSessionTeachingLearningProgramData') ? JSON.parse(localStorage.getItem('teachingAndLearningProgram_stateLearningSessionTeachingLearningProgramData')!).comment : this.unitReport.stateLearningSessionTeachingLearningProgramData.comment;
        if(this.unitReport.reportStatusDescription === 'Submitted'){
          this.reportInputReadable()
        }
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
        this.stateLearningSessionTeachingLearningProgramPlanData.target =  this.target!;
        this.stateLearningSessionTeachingLearningProgramPlanData.dateAndAction =  this.dateAndAction!;
      
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
        this.stateLearningSessionTeachingLearningProgramData.target =  this.target!;
        this.stateLearningSessionTeachingLearningProgramData.dateAndAction =  this.dateAndAction!;
        this.stateLearningSessionTeachingLearningProgramData.actual =  this.actual!;
        this.stateLearningSessionTeachingLearningProgramData.averageAttendance =  this.averageAttendance!;
        this.stateLearningSessionTeachingLearningProgramData.comment =  this.comment!;

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
      let tab = document.querySelectorAll('.my_tab')[13] as HTMLElement
      tab.click()
    }

    onUnitPlanUpdated = async (id: number) => {
    }

    onUnitPlanUpdateFailed = (e: {$values: string[]}) => {
    }

    planInputReadable() {
    }
    
    reportInputReadable() {
    }
}