---
course_id: calculus1_real_check
source_title: Calculus 1 Problem Set (100 Problems)
source_type: latex-problem-set
source_file: user-provided-inline-latex
intake_status: example-fixture
math_format: latex
needs_human_review: true
---

# LaTeX Problem Set Intake

## Source Metadata

- Source title: Calculus 1: Problem Set (100 Problems)
- Source file: provided inline by user during Engine 3 building-block design
- Intended course: `calculus1_real_check`
- Use mode: `manual-review-first`

## Part To Module Map

| Part | Section Label | Suggested Module | Suggested CLO | Suggested Bloom | Notes |
| --- | --- | --- | --- | --- | --- |
| Part I | Limits | limits-and-functions | CLO1 | understand | some items may later support CLO2 |
| Part II | Derivatives | differentiation | CLO2 | apply | later rows may branch to CLO3 or CLO4 |
| Part III | Integrals | integration | CLO2 | apply | later rows may branch to CLO4 |

## Review Notes

- This fixture exists to pressure-test the shared `LaTeX Problem Set Intake` block for Engine 3.
- All mathematics should remain in LaTeX form when rows are later moved into `problem-pool-starter.md` or `problem-pool.json`.
- This intake is intentionally closer to source than to the later normalized assessment pool.

## Raw Problem Blocks

```tex
\documentclass[12pt]{article}
\usepackage{amsmath, amssymb}
\usepackage[a4paper, margin=1in]{geometry}

\title{Calculus 1: Problem Set (100 Problems)}
\author{}
\date{}

\newenvironment{problem}{
  \vspace{0.5em}
  \noindent
}{\vspace{0.5em}}

\begin{document}

\maketitle

\section*{Part I: Limits (1--30)}

\begin{problem}1. $\lim_{x \to 2} \frac{x^2 - 4}{x - 2}$\end{problem}
\begin{problem}2. $\lim_{x \to 0} \frac{\sin x}{x}$\end{problem}
\begin{problem}3. $\lim_{x \to 0} \frac{1 - \cos x}{x^2}$\end{problem}
\begin{problem}4. $\lim_{x \to \infty} \frac{3x^2 + 1}{x^2 - 5}$\end{problem}
\begin{problem}5. $\lim_{x \to 0} \frac{\tan x}{x}$\end{problem}
\begin{problem}6. $\lim_{x \to 1} \frac{x^3 - 1}{x - 1}$\end{problem}
\begin{problem}7. $\lim_{x \to 0} \frac{e^x - 1}{x}$\end{problem}
\begin{problem}8. $\lim_{x \to \infty} \frac{5x}{e^x}$\end{problem}
\begin{problem}9. $\lim_{x \to 0} \frac{\ln(1+x)}{x}$\end{problem}
\begin{problem}10. $\lim_{x \to 0} \frac{\sin(2x)}{x}$\end{problem}

\begin{problem}11. $\lim_{x \to -1} \frac{x^2 - 1}{x + 1}$\end{problem}
\begin{problem}12. $\lim_{x \to \infty} \frac{\ln x}{x}$\end{problem}
\begin{problem}13. $\lim_{x \to 0} \frac{e^{2x} - 1}{x}$\end{problem}
\begin{problem}14. $\lim_{x \to \infty} \frac{x^2}{e^x}$\end{problem}
\begin{problem}15. $\lim_{x \to 0} \frac{\tan(3x)}{x}$\end{problem}

\begin{problem}16. $\lim_{x \to 0} \frac{\sqrt{1+x} - 1}{x}$\end{problem}
\begin{problem}17. $\lim_{x \to \infty} \frac{7x^3 + x}{2x^3 - 1}$\end{problem}
\begin{problem}18. $\lim_{x \to 0} \frac{\sin x - x}{x^3}$\end{problem}
\begin{problem}19. $\lim_{x \to \infty} \frac{e^x}{x^3}$\end{problem}
\begin{problem}20. $\lim_{x \to 0} \frac{\ln(1+2x)}{x}$\end{problem}

\begin{problem}21. $\lim_{x \to 2} \frac{\sqrt{x+2} - 2}{x-2}$\end{problem}
\begin{problem}22. $\lim_{x \to \infty} \frac{1}{\sqrt{x}}$\end{problem}
\begin{problem}23. $\lim_{x \to 0} \frac{\sin^2 x}{x^2}$\end{problem}
\begin{problem}24. $\lim_{x \to \infty} \frac{x}{\ln x}$\end{problem}
\begin{problem}25. $\lim_{x \to 0} \frac{e^x - \cos x}{x}$\end{problem}

\begin{problem}26. $\lim_{x \to \infty} \frac{2^x}{x^5}$\end{problem}
\begin{problem}27. $\lim_{x \to 0} \frac{\tan x - x}{x^3}$\end{problem}
\begin{problem}28. $\lim_{x \to \infty} \frac{\ln x}{\sqrt{x}}$\end{problem}
\begin{problem}29. $\lim_{x \to 0} \frac{1 - \cos(2x)}{x^2}$\end{problem}
\begin{problem}30. $\lim_{x \to \infty} \frac{x^3}{e^{2x}}$\end{problem}

\section*{Part II: Derivatives (31--70)}

\begin{problem}31. $\frac{d}{dx}(x^3)$\end{problem}
\begin{problem}32. $\frac{d}{dx}(\sin x)$\end{problem}
\begin{problem}33. $\frac{d}{dx}(\cos x)$\end{problem}
\begin{problem}34. $\frac{d}{dx}(e^x)$\end{problem}
\begin{problem}35. $\frac{d}{dx}(\ln x)$\end{problem}

\begin{problem}36. $\frac{d}{dx}(x^2 \sin x)$\end{problem}
\begin{problem}37. $\frac{d}{dx}(x^3 e^x)$\end{problem}
\begin{problem}38. $\frac{d}{dx}(\ln(x^2+1))$\end{problem}
\begin{problem}39. $\frac{d}{dx}(\sin(x^2))$\end{problem}
\begin{problem}40. $\frac{d}{dx}(e^{3x})$\end{problem}

\begin{problem}41. $\frac{d}{dx}(\tan x)$\end{problem}
\begin{problem}42. $\frac{d}{dx}(\sec x)$\end{problem}
\begin{problem}43. $\frac{d}{dx}(\ln(\sin x))$\end{problem}
\begin{problem}44. $\frac{d}{dx}(x e^x)$\end{problem}
\begin{problem}45. $\frac{d}{dx}(\frac{1}{x})$\end{problem}

\begin{problem}46. $\frac{d}{dx}(x^2 + 3x + 1)$\end{problem}
\begin{problem}47. $\frac{d}{dx}(\sqrt{x})$\end{problem}
\begin{problem}48. $\frac{d}{dx}(x^x)$\end{problem}
\begin{problem}49. $\frac{d}{dx}(\arctan x)$\end{problem}
\begin{problem}50. $\frac{d}{dx}(\ln(e^x+1))$\end{problem}

\begin{problem}51. $\frac{d}{dx}(x^2 \ln x)$\end{problem}
\begin{problem}52. $\frac{d}{dx}(\sin x \cos x)$\end{problem}
\begin{problem}53. $\frac{d}{dx}(e^{x^2})$\end{problem}
\begin{problem}54. $\frac{d}{dx}(\ln(x^3))$\end{problem}
\begin{problem}55. $\frac{d}{dx}(x \tan x)$\end{problem}

\begin{problem}56. $\frac{d}{dx}(\cos(2x))$\end{problem}
\begin{problem}57. $\frac{d}{dx}(e^x \sin x)$\end{problem}
\begin{problem}58. $\frac{d}{dx}(\ln(\cos x))$\end{problem}
\begin{problem}59. $\frac{d}{dx}(x^4)$\end{problem}
\begin{problem}60. $\frac{d}{dx}(\frac{x^2+1}{x})$\end{problem}

\begin{problem}61. $\frac{d}{dx}(\sqrt{1+x^2})$\end{problem}
\begin{problem}62. $\frac{d}{dx}(\ln(\tan x))$\end{problem}
\begin{problem}63. $\frac{d}{dx}(x^5 e^x)$\end{problem}
\begin{problem}64. $\frac{d}{dx}(\sin(3x))$\end{problem}
\begin{problem}65. $\frac{d}{dx}(e^{\sin x})$\end{problem}

\begin{problem}66. $\frac{d}{dx}(\ln(x+1))$\end{problem}
\begin{problem}67. $\frac{d}{dx}(\frac{\sin x}{x})$\end{problem}
\begin{problem}68. $\frac{d}{dx}(x^2 e^{2x})$\end{problem}
\begin{problem}69. $\frac{d}{dx}(\ln(\sqrt{x}))$\end{problem}
\begin{problem}70. $\frac{d}{dx}(\arcsin x)$\end{problem}

\section*{Part III: Integrals (71--100)}

\begin{problem}71. $\int x^2 \, dx$\end{problem}
\begin{problem}72. $\int \sin x \, dx$\end{problem}
\begin{problem}73. $\int \cos x \, dx$\end{problem}
\begin{problem}74. $\int e^x \, dx$\end{problem}
\begin{problem}75. $\int \frac{1}{x} \, dx$\end{problem}

\begin{problem}76. $\int x e^x \, dx$\end{problem}
\begin{problem}77. $\int x \sin x \, dx$\end{problem}
\begin{problem}78. $\int \ln x \, dx$\end{problem}
\begin{problem}79. $\int e^{2x} \, dx$\end{problem}
\begin{problem}80. $\int \cos(3x) \, dx$\end{problem}

\begin{problem}81. $\int \frac{1}{1+x^2} dx$\end{problem}
\begin{problem}82. $\int \frac{1}{\sqrt{1-x^2}} dx$\end{problem}
\begin{problem}83. $\int x^3 \, dx$\end{problem}
\begin{problem}84. $\int \tan x \, dx$\end{problem}
\begin{problem}85. $\int \sec x \tan x \, dx$\end{problem}

\begin{problem}86. $\int \frac{1}{x^2} dx$\end{problem}
\begin{problem}87. $\int x^2 e^x \, dx$\end{problem}
\begin{problem}88. $\int x \ln x \, dx$\end{problem}
\begin{problem}89. $\int e^x \cos x \, dx$\end{problem}
\begin{problem}90. $\int \sin(2x) \, dx$\end{problem}

\begin{problem}91. $\int \frac{1}{x \ln x} dx$\end{problem}
\begin{problem}92. $\int x^4 \, dx$\end{problem}
\begin{problem}93. $\int \sec^2 x \, dx$\end{problem}
\begin{problem}94. $\int \frac{1}{\sqrt{x}} dx$\end{problem}
\begin{problem}95. $\int e^{-x} dx$\end{problem}

\begin{problem}96. $\int \ln(1+x) dx$\end{problem}
\begin{problem}97. $\int \frac{1}{(x+1)^2} dx$\end{problem}
\begin{problem}98. $\int \sin^2 x \, dx$\end{problem}
\begin{problem}99. $\int \cos^2 x \, dx$\end{problem}
\begin{problem}100. $\int x^2 \cos x \, dx$\end{problem}

\end{document}
```
