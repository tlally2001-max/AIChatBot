#!/usr/bin/env node
/**
 * Vapi Voice Call Test Suite
 * Tests the Vapi API configuration
 */

const fs = require('fs')
const path = require('path')

// Read .env.local directly
const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

const VAPI_API_KEY = envVars.VAPI_API_KEY
const VAPI_ASSISTANT_ID = envVars.VAPI_ASSISTANT_ID
const VAPI_PHONE_NUMBER_ID = envVars.VAPI_PHONE_NUMBER_ID
const TWILIO_ACCOUNT_SID = envVars.TWILIO_ACCOUNT_SID

console.log('\n🔍 Vapi Configuration Test Suite\n')
console.log('=' .repeat(50))

// Test 1: Check environment variables
console.log('\n📋 Test 1: Environment Variables')
console.log('-'.repeat(50))

const configs = [
  { name: 'VAPI_API_KEY', value: VAPI_API_KEY },
  { name: 'VAPI_ASSISTANT_ID', value: VAPI_ASSISTANT_ID },
  { name: 'VAPI_PHONE_NUMBER_ID', value: VAPI_PHONE_NUMBER_ID },
  { name: 'TWILIO_ACCOUNT_SID', value: TWILIO_ACCOUNT_SID, required: false },
]

let allConfigsPresent = true
configs.forEach(cfg => {
  const status = cfg.value ? '✅' : cfg.required === false ? '⚠️ ' : '❌'
  const required = cfg.required === false ? '(optional)' : '(required)'
  console.log(`${status} ${cfg.name} ${required}`)
  if (!cfg.value && cfg.required !== false) allConfigsPresent = false
})

if (!allConfigsPresent) {
  console.log('\n❌ Missing required environment variables!')
  process.exit(1)
}

// Test 2: Test API Key validity
console.log('\n📱 Test 2: Vapi API Key Validity')
console.log('-'.repeat(50))

async function testVapiAuth() {
  try {
    // Try a simple call to test auth
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: VAPI_ASSISTANT_ID,
        phoneNumberId: VAPI_PHONE_NUMBER_ID,
      }),
    })

    if (response.status === 400 || response.status === 422) {
      // Bad request but auth worked
      console.log('✅ Vapi API Key is valid (got validation error, which means auth worked)')
      return true
    } else if (response.status === 401) {
      console.log('❌ API Key invalid or expired')
      return false
    } else {
      const data = await response.json()
      console.log(`API returned status ${response.status}`)
      console.log('Response:', data)
      return response.status !== 401
    }
  } catch (error) {
    console.log('❌ Failed to validate API key:', error.message)
    return false
  }
}

// Test 3: Test making a call (requires phone number and Twilio)
console.log('\n📞 Test 3: Test Voice Call')
console.log('-'.repeat(50))

async function testVoiceCall() {
  // Use example phone number for testing
  const testPhoneNumber = '+17253739952'
  console.log(`Using test phone number: ${testPhoneNumber}`)

  const payload = {
    phoneNumberId: VAPI_PHONE_NUMBER_ID,
    assistantId: VAPI_ASSISTANT_ID,
    customer: {
      name: 'Test User',
      number: testPhoneNumber,
    },
    phoneNumber: {
      twilioPhoneNumber: testPhoneNumber,
      twilioAccountSid: TWILIO_ACCOUNT_SID,
    },
    assistantOverrides: {
      firstMessage: 'Hi! This is a test call from Vapi. How can I help you?',
    },
  }

  console.log('\n📤 Sending payload:')
  console.log(JSON.stringify(
    {
      ...payload,
      phoneNumber: { ...payload.phoneNumber, twilioPhoneNumber: '***' },
    },
    null,
    2
  ))

  try {
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (response.ok) {
      console.log('\n✅ Voice call initiated successfully!')
      console.log('Call ID:', data.id)
      console.log('Status:', data.status)
      return true
    } else {
      console.log('\n❌ Failed to initiate call')
      console.log('Status:', response.status)
      console.log('Error:', JSON.stringify(data, null, 2))
      return false
    }
  } catch (error) {
    console.log('\n❌ Error:', error.message)
    return false
  }
}

// Run tests
;(async () => {
  const authValid = await testVapiAuth()

  if (authValid) {
    await testVoiceCall()
  }

  console.log('\n' + '='.repeat(50))
  console.log('Test suite completed\n')
})()
