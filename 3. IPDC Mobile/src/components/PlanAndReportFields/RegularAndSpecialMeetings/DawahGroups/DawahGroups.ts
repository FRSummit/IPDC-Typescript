import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import WithRender from './dawah-groups.html';

@WithRender

@Component
export default class DawahGroups extends Vue {
    target !: ''
    dateAndAction !: ''
    actual !: ''
    averageAttendance !: ''
    comment !: ''

    data() {
        return {
            planOrReportTab: 'REPORT',
            target: null,
            dateAndAction: null,
            actual: null,
            averageAttendance: null, 
            comment: null,
        }
    }
    
    backButton() {
        this.$router.push('/report-landing-swip')
    }

    onSubmit() {
        const dawahGroups = {
            target: this.target,
            dateAndAction: this.dateAndAction,
            actual: this.actual,
            averageAttendance: this.averageAttendance,
            comment: this.comment,
        }
        console.log(dawahGroups)
    }
}