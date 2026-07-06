export default {
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        status: {
          todo: 'rgb(var(--color-status-todo) / <alpha-value>)',
          progress: 'rgb(var(--color-status-progress) / <alpha-value>)',
          review: 'rgb(var(--color-status-review) / <alpha-value>)',
          done: 'rgb(var(--color-status-done) / <alpha-value>)',
        },
        priority: {
          low: 'rgb(var(--color-priority-low) / <alpha-value>)',
          medium: 'rgb(var(--color-priority-medium) / <alpha-value>)',
          high: 'rgb(var(--color-priority-high) / <alpha-value>)',
        },
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};