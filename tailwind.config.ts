import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				/* Core Colors */
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				/* Game Board Colors */
				'board-bg': 'hsl(var(--board-bg))',
				'board-border': 'hsl(var(--board-border))',
				'safe-square': 'hsl(var(--safe-square))',
				'center-finish': 'hsl(var(--center-finish))',

				/* Player Colors */
				'player-red': 'hsl(var(--player-red))',
				'player-red-light': 'hsl(var(--player-red-light))',
				'player-blue': 'hsl(var(--player-blue))',
				'player-blue-light': 'hsl(var(--player-blue-light))',
				'player-green': 'hsl(var(--player-green))',
				'player-green-light': 'hsl(var(--player-green-light))',
				'player-yellow': 'hsl(var(--player-yellow))',
				'player-yellow-light': 'hsl(var(--player-yellow-light))',

				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					shadow: 'hsl(var(--card-shadow))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				soft: 'var(--shadow-soft)',
				medium: 'var(--shadow-medium)',
				strong: 'var(--shadow-strong)',
				glow: 'var(--shadow-glow)',
				piece: 'var(--shadow-piece)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'piece-idle': {
					'0%': { transform: 'translateY(0px) scale(1)' },
					'100%': { transform: 'translateY(-2px) scale(1.02)' }
				},
				'piece-glow': {
					'0%': { 
						boxShadow: 'var(--shadow-piece), 0 0 0 0 hsl(var(--primary) / 0.4)' 
					},
					'100%': { 
						boxShadow: 'var(--shadow-piece), 0 0 0 8px hsl(var(--primary) / 0)' 
					}
				},
				'player-glow': {
					'0%': { 
						boxShadow: 'var(--shadow-soft)',
						transform: 'scale(1)' 
					},
					'100%': { 
						boxShadow: 'var(--shadow-glow)',
						transform: 'scale(1.02)' 
					}
				},
				'dice-idle': {
					'0%, 100%': { transform: 'rotate(0deg) scale(1)' },
					'50%': { transform: 'rotate(1deg) scale(1.01)' }
				},
				'dice-roll': {
					'0%': { transform: 'rotate(0deg) scale(1)' },
					'25%': { transform: 'rotate(90deg) scale(1.1)' },
					'50%': { transform: 'rotate(180deg) scale(1.2)' },
					'75%': { transform: 'rotate(270deg) scale(1.1)' },
					'100%': { transform: 'rotate(360deg) scale(1)' }
				},
				'bounce-in': {
					'0%': {
						transform: 'scale(0.3) translateY(20px)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1.05) translateY(-10px)'
					},
					'70%': {
						transform: 'scale(0.9) translateY(5px)'
					},
					'100%': {
						transform: 'scale(1) translateY(0)',
						opacity: '1'
					}
				},
				'slide-in-up': {
					'0%': {
						transform: 'translateY(100px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'fade-in-scale': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'celebration': {
					'0%, 100%': { transform: 'scale(1) rotate(0deg)' },
					'25%': { transform: 'scale(1.1) rotate(-5deg)' },
					'75%': { transform: 'scale(1.1) rotate(5deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'piece-idle': 'piece-idle 2s ease-in-out infinite alternate',
				'piece-glow': 'piece-glow 1s ease-in-out infinite alternate',
				'player-glow': 'player-glow 2s ease-in-out infinite alternate',
				'dice-idle': 'dice-idle 3s ease-in-out infinite',
				'dice-roll': 'dice-roll var(--dice-duration) cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'bounce-in': 'bounce-in var(--bounce-duration) cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'slide-in-up': 'slide-in-up var(--slide-duration) ease-out',
				'fade-in-scale': 'fade-in-scale var(--fade-duration) ease-out',
				'celebration': 'celebration 0.6s ease-in-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
