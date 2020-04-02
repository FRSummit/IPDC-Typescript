import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import WithRender from './study-circle-am.html';
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
export default class StudyCircleAM extends Vue {
    planOrReportTab !: null
    studyCircleForAssociateMemberTeachingLearningProgramPlanData !: TeachingLearningProgramPlanData;
    studyCircleForAssociateMemberTeachingLearningProgramData !: TeachingLearningProgramData;
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
            averageAttendance: null,
            comment: null,
            progressbar: false
        }
    }

    async created() {
      this.$store.state.reportStatusFromInput = 'teaching-section'
      this.planOrReportTabStatus = JSON.parse(localStorage.getItem('reportStatusDescriptionForInput')!).Status
      this.unitReportId= localStorage.getItem('planandreports_passing_unit_id')
      let tabActivationForPlanOrReport = JSON.parse(localStorage.getItem('reportingLanding_tab_activation')!).Tab
      this.planOrReportTab = tabActivationForPlanOrReport
      if(tabActivationForPlanOrReport === 'PLAN') {
        this.unitPlan = await this.unitPlanReportService.getPlan(this.unitReportId);
        const initialData = planDataBuilder.getPlanData(this.unitPlan);
        this.unitPlanModifiedData = this.unitPlan;
        this.initialJson = JSON.stringify(initialData);
        this.studyCircleForAssociateMemberTeachingLearningProgramPlanData = this.unitPlan.studyCircleForAssociateMemberTeachingLearningProgramPlanData;
        this.target = localStorage.getItem('teachingAndLearningProgram_studyCircleForAssociateMemberTeachingLearningProgramPlanData') ? JSON.parse(localStorage.getItem('teachingAndLearningProgram_studyCircleForAssociateMemberTeachingLearningProgramPlanData')!).target : this.unitPlan.studyCircleForAssociateMemberTeachingLearningProgramPlanData.target;
        this.dateAndAction = localStorage.getItem('teachingAndLearningProgram_studyCircleForAssociateMemberTeachingLearningProgramPlanData') ? JSON.parse(localStorage.getItem('teachingAndLearningProgram_studyCircleForAssociateMemberTeachingLearningProgramPlanData')!).dateAndAction : this.unitPlan.studyCircleForAssociateMemberTeachingLearningProgramPlanData.dateAndAction;
      } else if(tabActivationForPlanOrReport === 'REPORT') {
        this.unitReport = await this.unitPlanReportService.getReport(this.unitReportId);
        this.unitReportModifiedData = this.unitReport;
        const initialData = reportDataBuilder.getMemberReportData(this.unitReport);
        this.initialJson = JSON.stringify(initialData);
        this.studyCircleForAssociateMemberTeachingLearningProgramData = this.unitReport.studyCircleForAssociateMemberTeachingLearningProgramData;
        this.target = localStorage.getItem('teachingAndLearningProgram_studyCircleForAssociateMemberTeachingLearningProgramData') ? JSON.parse(localStorage.getItem('teachingAndLearningProgram_studyCircleForAssociateMemberTeachingLearningProgramData')!).target : this.unitReport.studyCircleForAssociateMemberTeachingLearningProgramData.target;
        this.dateAndAction = localStorage.getItem('teachingAndLearningProgram_studyCircleForAssociateMemberTeachingLearningProgramData') ? JSON.parse(localStorage.getItem('teachingAndLearningProgram_studyCircleForAssociateMemberTeachingLearningProgramData')!).dateAndAction : this.unitReport.studyCircleForAssociateMemberTeachingLearningProgramData.dateAndAction;
        this.actual = localStorage.getItem('teachingAndLearningProgram_studyCircleForAssociateMemberTeachingLearningProgramData') ? JSON.parse(localStorage.getItem('teachingAndLearningProgram_studyCircleForAssociateMemberTeachingLearningProgramData')!).actual : this.unitReport.studyCircleForAssociateMemberTeachingLearningProgramData.actual;
        this.averageAttendance = localStorage.getItem('teachingAndLearningProgram_studyCircleForAssociateMemberTeachingLearningProgramData') ? JSON.parse(localStorage.getItem('teachingAndLearningProgram_studyCircleForAssociateMemberTeachingLearningProgramData')!).averageAttendance : this.unitReport.studyCircleForAssociateMemberTeachingLearningProgramData.averageAttendance;
        this.comment = localStorage.getItem('teachingAndLearningProgram_studyCircleForAssociateMemberTeachingLearningProgramData') ? JSON.parse(localStorage.getItem('teachingAndLearningProgram_studyCircleForAssociateMemberTeachingLearningProgramData')!).comment : this.unitReport.studyCircleForAssociateMemberTeachingLearningProgramData.comment;
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
        this.studyCircleForAssociateMemberTeachingLearningProgramPlanData.target =  this.target!;
        this.studyCircleForAssociateMemberTeachingLearningProgramPlanData.dateAndAction =  this.dateAndAction!;
        this.unitPlanModifiedData.studyCircleForAssociateMemberTeachingLearningProgramPlanData = this.studyCircleForAssociateMemberTeachingLearningProgramPlanData;
      
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
        this.studyCircleForAssociateMemberTeachingLearningProgramData.target =  this.target!;
        this.studyCircleForAssociateMemberTeachingLearningProgramData.dateAndAction =  this.dateAndAction!;
        this.studyCircleForAssociateMemberTeachingLearningProgramData.actual =  this.actual!;
        this.studyCircleForAssociateMemberTeachingLearningProgramData.averageAttendance =  this.averageAttendance!;
        this.studyCircleForAssociateMemberTeachingLearningProgramData.comment =  this.comment!;
        this.unitReportModifiedData.studyCircleForAssociateMemberTeachingLearningProgramData = this.studyCircleForAssociateMemberTeachingLearningProgramData;

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
      let tab = document.querySelectorAll('.my_tab')[3] as HTMLElement
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
      let tab = document.querySelectorAll('.my_tab')[3] as HTMLElement
      this.$router.replace('/plan-and-report-edit/teaching-and-learning-program/practice-darsSpeech')
      tab.click()
    }
    previousBtn() {
      let tab = document.querySelectorAll('.my_tab')[1] as HTMLElement
      this.$router.replace('/plan-and-report-edit/teaching-and-learning-program/study-circle')
      tab.click()
    }
    mounted() {
      if(document.querySelector('.navbar')) {
        let navbar = document.querySelector('.navbar') as HTMLElement
        navbar.classList.add('hide')
      }
    }
}