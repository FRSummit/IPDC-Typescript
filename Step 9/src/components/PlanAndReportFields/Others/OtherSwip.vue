<template>
    <div class="report-landing-vue">
        <v-ons-page class="Page-MT">
            <v-card color="basil">
                <v-tabs v-model="tab" background-color="transparent" grow>
                <v-tab class="my_tab"  v-for="item in items" :key="item">{{ item }}</v-tab>
                </v-tabs>
                <v-tabs-items v-model="tab">
                <v-tab-item v-for="item in items" :key="item">
                    <v-card color="basil" flat>
                    <v-card v-if="item === 'BookLibrary'"><BookLibrary/></v-card>
                    <v-card v-if="item === 'OtherLibrary'"><OtherLibrary/></v-card>
                    <v-card v-if="item === 'VHSLibrary'"><VHSLibrary/></v-card>
                    </v-card>
                </v-tab-item>
                </v-tabs-items>
            </v-card>
        </v-ons-page>
    </div>
</template>

<script>
import BookLibrary from './BookLibrary/BookLibrary.vue'
import OtherLibrary from './OtherLibrary/OtherLibrary.vue'
import VHSLibrary from './VHSLibrary/VHSLibrary.vue'

export default {
  components: {
      BookLibrary,
      OtherLibrary,
      VHSLibrary
  },
  data() {
      return {
            tab: null,
            items: ['BookLibrary', 'OtherLibrary', 'VHSLibrary']
      }
  },
}
</script>