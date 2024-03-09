<template>
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
      :stroke="color"
    >
      <g
        fill="none"
        fill-rule="evenodd"
      >
        <g
          transform="translate(1 1)"
          stroke-width="2"
        >
          <circle
            stroke-opacity=".5"
            cx="18"
            cy="18"
            r="18"
          />
          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </g>
    </svg>
  </template>
  
  <script>
  // HTML by Sam Herbert (@sherb), for everyone. More @ http://goo.gl/7AJzbL
  
  export default {
    props: {
      ratio: {
        required: false,
        type: [Number, String],
        default: 3
      },
      color: {
        required: false,
        type: String,
        default: '#b9b9b9'
      }
    },
    computed: {
      size () {
        const baseSize = 30
  
        const size = baseSize * this.ratio
  
        return `${size}px`
      }
    }
  }
  </script>
  