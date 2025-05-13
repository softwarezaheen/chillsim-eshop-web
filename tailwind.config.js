/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#122644",
        secondary: "#eb224d",

        primary: {
          DEFAULT: "#122644",
          900: "#122644",
          800: "#253A5A",
          700: "#3A4F70",
          600: "#4F6486",
          500: "#65799C",
          400: "#7B8FB2",
          300: "#92A5C8",
          200: "#AABBDC",
          100: "#C3D2EE",
          50: "#F6FBFF",
        },

        secondary: {
          DEFAULT: "#eb224d",
          900: "#eb224d",
          800: "#ed385e",
          700: "#ef4e70",
          600: "#f16482",
          500: "#f37a94",
          400: "#f590a6",
          300: "#f7a6b7",
          200: "#f9bcc9",
          100: "#fbd2db",
          50: "#fde8ed",
        },

        title: {
          DEFAULT: "#A28B6F",
        },

        error: "#FF0000",
        success: "#009165",
        warning: "#F68C4E",
      },
      borderColor: {
        shade: {
          900: "#2c2b2b",
          800: "#393838",
          700: "#464444",
          600: "#535151",
          500: "#605e5e",
          400: "#6d6a6a",
          300: "#7a7777",
        },
      },
      boxShadow: {
        sm: "0px 0px 4.08px 0px #0000001f",
        md: "0px 0px 8px 0px #0000003f",
      },
      spacing: {
        xs: "0.5rem",
        sm: "0.7rem",
        base: "1rem",
      },
      backgroundColor: {
        bgLight: "#f2f4f7",
        bgGrey: "#ececec",
      },
      textColor: {
        content: {
          900: "#2c2b2b",
          800: "#393838",
          700: "#464444",
          600: "#535151",
          500: "#605e5e",
          400: "#6d6a6a",
          300: "#7a7777",
        },
      },
      fontFamily: {
        quicksandLight: ["quicksand-light"],
        quicksandRegular: ["quicksand-regular"],
        quicksandMedium: ["quicksand-medium"],
        quicksandSemibold: ["quicksand-semibold"],
        quicksandBold: ["quicksand-bold"],
      },

      fontSize: {
        xs: "0.75rem", // 12px
        sm: "0.875rem", // 14px
        base: "1rem", // 16px
        lg: "1.125rem", // 18px
        xl: "1.25rem", // 20px
        "2xl": "1.5rem", // 24px
        "3xl": "1.875rem", // 30px
        "4xl": "2.25rem", // 36px
        "5xl": "3rem", // 48px
      },
      maxWidth: {
        xxl: "2000px",
      },
      screens: {
        xs: "475px",
      },
      borderRadius: {
        DEFAULT: "10px",
        lg: "20px",
        md: "7px",
        sm: "3px",
      },
      animation: {
        slowspin: "spin 3s linear infinite", // Slower (3s per rotation)
        fastspin: "spin 500ms linear infinite", // Faster (0.5s per rotation)
      },
    },
  },
  plugins: [
    function ({ addComponents, addBase, theme }) {
      addComponents({
        ".font-bold": {
          fontFamily: theme("fontFamily.quicksandBold"),
        },
        ".font-medium": {
          fontFamily: theme("fontFamily.quicksandMedium"),
        },
        ".font-semibold": {
          fontFamily: theme("fontFamily.quicksandSemibold"),
        },
      }),
        addBase({
          ":root": {
            "--error": theme("colors.error"),
            "--warning": theme("colors.warning"),
            "--success": theme("colors.success"),
          },
          body: {
            color: "#122644",
            fontSize: "1rem",
            fontFamily: "quicksand-regular",
          },
          h1: {
            fontSize: "1.5rem",
            color: "#A28B6F",
            fontFamily: "quicksand-bold",
          },
          h2: {
            color: "#A28B6F",
          },
          h4: {
            color: "#A28B6F",
          },
          h3: {
            fontSize: "1.25",
            color: "#A28B6F",
            fontFamily: "quicksand-bold",
          },

          h6: {
            color: "#A28B6F",
            fontFamily: "quicksand-semibold",
          },
          label: {
            fontFamily: "quicksand-semibold",
            color: "#122644",
          },
        });
    },
  ],
};
