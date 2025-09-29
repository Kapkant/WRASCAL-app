<script setup lang="ts">
import createClient from '@supabase/supabase-js'
import { Auth, ThemeBold, type Appereance, css } from 'vue-auth-ui'

const supabase = createClient(
  'my-project-url',
  'my-anon-key'
)

const appearance: Appereance = {
  theme: ThemeBold,
  themeVariant: 'dark',
  // In addition to theme and variant you can specify other preferences.
  // More on that in the "customization" section.
  prependedClassName: 'my-custom-class',
  className: {
    button: css({
      variants: {
        color: {
          primary: {
            backgroundColor: 'blue'
          }
        }
      }
    })
  }
}

let myError: string | undefined
const signIn = async (creds: any) => {
  myError = undefined
  const { data, error } = await supabase.auth.signInWithPassword(creds)
  myError = error?.message

  // Custom logic, like `router.push('/')` etc.
}
</script>

<template>
  <Auth :providers="['google']" socialLayout="col" :appearance="appearance" :error="myError"
    @signInWithPassword="creds => signIn(creds)" @signUp="creds => supabase.auth.signUp(creds)"
    @signInWithOAuth="provider => supabase.auth.signInWithOAuth(provider)" />
</template>
