<template>
  <v-container class="pt-8">
    <h1>Log In</h1>
    <br />
    <form @submit.prevent="submitForm">
      <v-alert type="error" v-if="showAlert" class="mt-2">
        {{ loginError }}
      </v-alert>
      <v-row class="pt-8">
        <v-col cols="12" md="12">
          <v-text-field
            label="Email"
            prepend-icon="mdi-list-box-outline"
            variant="solo"
            :loading="isLoading ?? false"
            v-model:model-value="emailValue"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="12">
          <v-text-field
            label="Password"
            prepend-icon="mdi-lock"
            variant="solo"
            :loading="isLoading ?? false"
            v-model:model-value="passwordValue"
            type="password"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6"> </v-col>

        <v-col cols="12" md="6"> </v-col>
      </v-row>
      <v-btn
        type="submit"
        block
        class="mt-2"
        color="primary"
        @click="submitForm"
        >Submit</v-btn
      >
    </form>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { supabase } from "@/utils/supabase";
import { userAuthStore } from "@/stores/userAuthStore";

export default defineComponent({
  name: "NewEntryForm",
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      default: "",
    },
    formula: {
      type: String,
      default: "",
    },
    metalCharge: {
      type: String,
      default: "",
    },
    ligandCharge: {
      type: String,
      default: "",
    },
  },
  data: () => ({
    emailValue: "",
    passwordValue: "",
    ligandChargeValue: "",
    loginError: "",
    showAlert: false,
  }),
  methods: {
    async submitForm() {
      if (!supabase) {
        alert("Authentication is not configured. Please contact the administrator.");
        return;
      }
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: this.emailValue,
          password: this.passwordValue,
        });
        if (error === null) {
          const authStore = userAuthStore(); // Access the store
          authStore.login(); // Update the isLoggedIn state
          this.$router.push("/");
        } else {
          this.loginError = error.message;
          this.showAlert = true;
        }
      } catch (error) {
        console.log("Error: ", error);
      }
    },
  },
});
</script>
