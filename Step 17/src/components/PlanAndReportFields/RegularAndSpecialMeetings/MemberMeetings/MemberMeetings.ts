import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import WithRender from './member-meetings.html';
import { UnitPlanReportService } from "../../../../services/UnitPlanReportService"
import ons from 'onsenui';
import {MeetingProgramPlanData} from "../../../../models/MeetingProgramPlanData";
import {MeetingProgramData} from "../../../../models/MeetingProgramData";
import { UnitPlanViewModelDto } from "../../../../models/UnitPlanViewModelDto";
import { UnitReportViewModelDto } from "../../../../models/UnitReportViewModelDto";
import { planDataBuilder } from "../../../../PlanDataBuilder";
import { reportDataBuilder } from "../../../../ReportDataBuilder";
import { SignalrWrapper } from "../../../../signalrwrapper";

@WithRender

@Component
export default class MemberMeetings extends Vue {
  planOrReportTab !: null
  memberMeetingProgramPlanData !: MeetingProgramPlanData;
  memberMeetingProgramData !: MeetingProgramData;
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
        this.memberMeetingProgramPlanData = this.unitPlan.memberMeetingProgramPlanData;
        this.target = localStorage.getItem('regularAndSpecialMeetings_memberMeetingProgramPlanData') ? JSON.parse(localStorage.getItem('regularAndSpecialMeetings_memberMeetingProgramPlanData')!).target : this.unitPlan.memberMeetingProgramPlanData.target;
        this.dateAndAction = localStorage.getItem('regularAndSpecialMeetings_memberMeetingProgramPlanData') ? JSON.parse(localStorage.getItem('regularAndSpecialMeetings_memberMeetingProgramPlanData')!).dateAndAction : this.unitPlan.memberMeetingProgramPlanData.dateAndAction;
      } else if(tabActivationForPlanOrReport === 'REPORT') {
        this.unitReport = await this.unitPlanReportService.getReport(this.unitReportId);
        this.unitReportModifiedData = this.unitReport;
        const initialData = reportDataBuilder.getMemberReportData(this.unitReport);
        this.initialJson = JSON.stringify(initialData);
        this.memberMeetingProgramData = this.unitReport.memberMeetingProgramData;
        this.target = localStorage.getItem('regularAndSpecialMeetings_memberMeetingProgramData') ? JSON.parse(localStorage.getItem('regularAndSpecialMeetings_memberMeetingProgramData')!).target : this.unitReport.memberMeetingProgramData.target;
        this.dateAndAction = localStorage.getItem('regularAndSpecialMeetings_memberMeetingProgramData') ? JSON.parse(localStorage.getItem('regularAndSpecialMeetings_memberMeetingProgramData')!).dateAndAction : this.unitReport.memberMeetingProgramData.dateAndAction;
        this.actual = localStorage.getItem('regularAndSpecialMeetings_memberMeetingProgramData') ? JSON.parse(localStorage.getItem('regularAndSpecialMeetings_memberMeetingProgramData')!).actual : this.unitReport.memberMeetingProgramData.actual;
        this.averageAttendance = localStorage.getItem('regularAndSpecialMeetings_memberMeetingProgramData') ? JSON.parse(localStorage.getItem('regularAndSpecialMeetings_memberMeetingProgramData')!).averageAttendance : this.unitReport.memberMeetingProgramData.averageAttendance;
        this.comment = localStorage.getItem('regularAndSpecialMeetings_memberMeetingProgramData') ? JSON.parse(localStorage.getItem('regularAndSpecialMeetings_memberMeetingProgramData')!).comment : this.unitReport.memberMeetingProgramData.comment;
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
        this.memberMeetingProgramPlanData.target =  this.target!;
        this.memberMeetingProgramPlanData.dateAndAction =  this.dateAndAction!;
      
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
        this.memberMeetingProgramData.target =  this.target!;
        this.memberMeetingProgramData.dateAndAction =  this.dateAndAction!;
        this.memberMeetingProgramData.actual =  this.actual!;
        this.memberMeetingProgramData.averageAttendance =  this.averageAttendance!;
        this.memberMeetingProgramData.comment =  this.comment!;

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
      let tab = document.querySelectorAll('.my_tab')[4] as HTMLElement
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