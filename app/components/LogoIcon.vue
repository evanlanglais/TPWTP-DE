<template>
  <svg :width="size" :height="size" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Icon background -->
    <rect width="120" height="120" rx="22" fill="#0E1B3F"/>
    <rect x="0.75" y="0.75" width="118.5" height="118.5" rx="21.25" fill="none" stroke="white" stroke-opacity="0.09" stroke-width="1.5"/>

    <!-- Grid lines -->
    <line x1="11" y1="26" x2="109" y2="26" stroke="white" stroke-opacity="0.05" stroke-width="0.75"/>
    <line x1="11" y1="44" x2="109" y2="44" stroke="white" stroke-opacity="0.05" stroke-width="0.75"/>
    <line x1="11" y1="62" x2="109" y2="62" stroke="white" stroke-opacity="0.05" stroke-width="0.75"/>
    <line x1="11" y1="80" x2="109" y2="80" stroke="white" stroke-opacity="0.05" stroke-width="0.75"/>
    <line x1="11" y1="98" x2="109" y2="98" stroke="white" stroke-opacity="0.05" stroke-width="0.75"/>

    <!-- Prediction zone -->
    <rect x="97" y="13" width="11" height="95" rx="2" fill="#00C895" fill-opacity="0.055"/>
    <line x1="97.5" y1="13" x2="97.5" y2="108" stroke="#00C895" stroke-opacity="0.22" stroke-width="0.75" stroke-dasharray="3,2"/>

    <!-- Secondary (lower) rail -->
    <path d="M 11,93 C 17,93 27,24 37,24 C 47,24 52,80 60,80 C 68,80 75,41 82,41 C 89,41 94,57 97,57"
          stroke="#FF5722" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-opacity="0.28"/>

    <!-- Main track path -->
    <path d="M 11,92 C 17,92 27,20 37,20 C 47,20 52,76 60,76 C 68,76 75,37 82,37 C 89,37 94,53 97,53"
          stroke="#FF5722" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

    <!-- Prediction dashed line -->
    <path d="M 97,53 C 100,47 104,32 108,24"
          stroke="#FF5722" stroke-width="2" stroke-linecap="round" stroke-dasharray="4,3" fill="none" stroke-opacity="0.6"/>

    <!-- Data point dots -->
    <circle cx="37" cy="20" r="4.5" fill="#00C895" stroke="white" stroke-width="1.5"/>
    <circle cx="60" cy="76" r="4.5" fill="#00C895" stroke="white" stroke-width="1.5"/>
    <circle cx="82" cy="37" r="4.5" fill="#00C895" stroke="white" stroke-width="1.5"/>

    <!-- Hollow prediction endpoint -->
    <circle cx="108" cy="24" r="3.5" fill="#0E1B3F" stroke="#00C895" stroke-width="1.5"/>

    <!-- Cart body -->
    <rect x="3" y="82" width="19" height="10" rx="3" fill="white"/>
    <!-- Cart window -->
    <rect x="6" y="84" width="6.5" height="4.5" rx="1.5" fill="#0E1B3F"/>
    <!-- Antenna -->
    <line x1="17" y1="82" x2="17" y2="77" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="17" cy="76" r="1.5" fill="#FF5722"/>
    <!-- Wheels -->
    <circle cx="8" cy="93" r="3" fill="#18266A" stroke="#FF5722" stroke-width="1.5"/>
    <circle cx="8" cy="93" r="1" fill="#FF5722"/>
    <circle cx="19" cy="93" r="3" fill="#18266A" stroke="#FF5722" stroke-width="1.5"/>
    <circle cx="19" cy="93" r="1" fill="#FF5722"/>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 28 })
</script>
