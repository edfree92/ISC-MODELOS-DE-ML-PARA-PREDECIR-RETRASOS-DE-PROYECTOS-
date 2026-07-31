:root {
  --navy-950: #021f31;
  --navy-900: #032f45;
  --navy-850: #073b53;
  --navy-800: #0b4b66;
  --cyan: #08c8e8;
  --cyan-soft: #dff9fd;
  --paper: #f7fafb;
  --white: #ffffff;
  --ink: #102f3e;
  --muted: #69828f;
  --line: #a9cbd6;
  --line-dark: rgba(76, 165, 193, 0.42);
  --green: #21a67a;
  --amber: #d99424;
  --red: #c84650;
  --shadow: 0 24px 70px rgba(0, 17, 29, 0.28);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--navy-950);
  color: var(--ink);
  font-family: Arial, Helvetica, sans-serif;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

button:focus-visible,
input:focus-visible,
summary:focus-visible {
  outline: 3px solid rgba(8, 200, 232, 0.48);
  outline-offset: 3px;
}

.site-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 78% 6%, rgba(11, 113, 147, 0.3), transparent 26rem),
    linear-gradient(155deg, #032b40 0%, #053a50 54%, #022738 100%);
  color: var(--white);
}

.blueprint-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.33;
  background-image:
    linear-gradient(rgba(46, 157, 190, 0.17) 1px, transparent 1px),
    linear-gradient(90deg, rgba(46, 157, 190, 0.17) 1px, transparent 1px),
    linear-gradient(rgba(46, 157, 190, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(46, 157, 190, 0.08) 1px, transparent 1px);
  background-size: 42px 42px, 42px 42px, 8.4px 8.4px, 8.4px 8.4px;
  mask-image: linear-gradient(to bottom, black 0%, black 85%, transparent);
}

.technical-mark {
  position: fixed;
  z-index: 0;
  color: rgba(174, 229, 241, 0.68);
  font-family: "Courier New", monospace;
  font-size: 11px;
  pointer-events: none;
}

.left-mark {
  left: 18px;
  top: 170px;
  height: 470px;
  width: 42px;
  border-left: 1px solid rgba(178, 231, 241, 0.7);
  border-right: 1px solid rgba(178, 231, 241, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 7px;
}

.left-mark::before,
.left-mark::after {
  content: "";
  position: absolute;
  left: 0;
  width: 25px;
  border-top: 1px solid rgba(178, 231, 241, 0.7);
}

.left-mark::after {
  bottom: 0;
}

.right-mark {
  right: 44px;
  top: 112px;
  padding: 10px 18px 0 0;
  border-top: 1px dashed rgba(178, 231, 241, 0.7);
  border-right: 1px dashed rgba(178, 231, 241, 0.7);
  line-height: 1.5;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  min-height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 0 32px;
  background: rgba(2, 29, 45, 0.92);
  border-bottom: 1px solid rgba(160, 219, 233, 0.35);
  backdrop-filter: blur(18px);
}

.brand {
  border: 0;
  padding: 0;
  background: transparent;
  color: white;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -1px;
  white-space: nowrap;
}

.brand strong {
  color: var(--cyan);
}

.stepper {
  display: flex;
  align-self: stretch;
  align-items: stretch;
  gap: 5px;
}

.stepper button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 175px;
  padding: 0 16px;
  border: 0;
  background: transparent;
  color: rgba(222, 239, 244, 0.64);
  transition: color 0.2s ease, background 0.2s ease;
}

.stepper button::after {
  content: "";
  position: absolute;
  left: 15px;
  right: 15px;
  bottom: 0;
  height: 4px;
  transform: scaleX(0);
  background: var(--cyan);
  transition: transform 0.2s ease;
}

.stepper button:not(:last-child)::before {
  content: "";
  position: absolute;
  right: -6px;
  top: 50%;
  width: 14px;
  border-top: 1px solid rgba(149, 210, 224, 0.32);
}

.stepper button:disabled {
  cursor: not-allowed;
}

.stepper button.active {
  color: white;
  background: rgba(8, 200, 232, 0.05);
}

.stepper button.active::after {
  transform: scaleX(1);
}

.stepper button.complete {
  color: rgba(223, 247, 251, 0.88);
}

.stepper button span {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(186, 224, 234, 0.55);
  font-size: 16px;
  font-style: normal;
}

.stepper button.active span,
.stepper button.complete span {
  border-color: var(--cyan);
  background: var(--cyan);
  color: var(--navy-950);
  font-weight: 800;
}

.stepper button em {
  font-size: 14px;
  font-style: normal;
  white-space: nowrap;
}

.content-wrap {
  position: relative;
  z-index: 2;
  width: min(1360px, calc(100% - 120px));
  margin: 0 auto;
  min-height: calc(100vh - 130px);
  padding: 58px 0 70px;
}

.stage {
  animation: stage-enter 0.38s ease both;
}

@keyframes stage-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stage-heading {
  max-width: 920px;
  margin-bottom: 30px;
}

.stage-heading h1 {
  max-width: 900px;
  margin: 10px 0 11px;
  color: white;
  font-size: clamp(38px, 4.3vw, 67px);
  line-height: 0.98;
  letter-spacing: -2.5px;
}

.stage-heading p {
  max-width: 830px;
  margin: 0;
  color: rgba(226, 241, 245, 0.82);
  font-size: 17px;
  line-height: 1.55;
}

.compact-heading h1 {
  font-size: clamp(37px, 4vw, 58px);
}

.eyebrow {
  display: inline-block;
  color: var(--cyan);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.layout-with-guide {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 22px;
  align-items: start;
}

.blueprint-panel,
.guide-panel {
  position: relative;
  color: var(--ink);
  background:
    linear-gradient(135deg, transparent 10px, rgba(255, 255, 255, 0.98) 0) top left,
    linear-gradient(225deg, transparent 10px, rgba(255, 255, 255, 0.98) 0) top right,
    linear-gradient(315deg, transparent 10px, rgba(255, 255, 255, 0.98) 0) bottom right,
    linear-gradient(45deg, transparent 10px, rgba(255, 255, 255, 0.98) 0) bottom left;
  background-size: 52% 52%;
  background-repeat: no-repeat;
  filter: drop-shadow(0 18px 32px rgba(0, 15, 25, 0.2));
}

.blueprint-panel::before,
.guide-panel::before {
  content: "";
  position: absolute;
  inset: 7px;
  pointer-events: none;
  border: 1px solid rgba(71, 158, 184, 0.46);
}

.main-panel {
  padding: 32px 36px 26px;
}

.guide-panel {
  position: sticky;
  top: 100px;
  padding: 34px 30px;
  background:
    linear-gradient(135deg, transparent 10px, rgba(238, 251, 253, 0.98) 0) top left,
    linear-gradient(225deg, transparent 10px, rgba(238, 251, 253, 0.98) 0) top right,
    linear-gradient(315deg, transparent 10px, rgba(238, 251, 253, 0.98) 0) bottom right,
    linear-gradient(45deg, transparent 10px, rgba(238, 251, 253, 0.98) 0) bottom left;
  background-size: 52% 52%;
  background-repeat: no-repeat;
}

.guide-panel h2 {
  margin: 10px 0 14px;
  font-size: 26px;
}

.guide-panel > p {
  margin: 0;
  color: #315465;
  font-size: 15px;
  line-height: 1.65;
}

.compass-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: 22px;
  border: 1px dashed #3ca6c3;
  border-radius: 50%;
  color: #0b82a5;
  font-size: 38px;
}

.guide-example {
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 12px;
  align-items: start;
  margin-top: 28px;
  padding: 18px;
  border: 1px solid #37b7d6;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
}

.guide-example > span {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid #1f9ebf;
  border-radius: 50%;
  color: #087d9e;
  font-weight: 800;
}

.guide-example p {
  margin: 0;
  color: #294e60;
  font-size: 13px;
  line-height: 1.55;
}

.guide-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  margin-top: 26px;
  padding-top: 18px;
  border-top: 1px solid #b6d7df;
  color: #2b5d70;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.guide-flow i {
  color: #0bbbd9;
  font-style: normal;
}

.panel-title {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
}

.panel-title > div {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-title h2 {
  margin: 0;
  color: var(--ink);
  font-size: 24px;
  letter-spacing: -0.6px;
}

.panel-title p {
  max-width: 380px;
  margin: 2px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.45;
  text-align: right;
}

.panel-number {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid #48a8c0;
  color: #087f9e;
  font-family: "Courier New", monospace;
  font-size: 12px;
  font-weight: 800;
}

.field-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 22px;
}

.field-grid.compact {
  margin-top: 18px;
}

.field-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.field-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
  color: #173a4b;
  font-size: 13px;
  font-weight: 800;
}

.pill {
  padding: 3px 6px;
  border-radius: 999px;
  font-size: 8px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.pill.required {
  background: #d8f7fc;
  color: #067994;
}

.pill.optional {
  background: #eef2f3;
  color: #70848d;
}

.input-shell {
  display: flex;
  align-items: center;
  min-height: 52px;
  padding: 0 13px;
  border: 1px solid #84b9c8;
  border-radius: 4px;
  background: rgba(252, 254, 255, 0.94);
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.input-shell:focus-within {
  border-color: #00a9cc;
  box-shadow: 0 0 0 3px rgba(0, 183, 219, 0.14);
}

.input-shell input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #123646;
  font-size: 23px;
  font-weight: 800;
}

.input-shell > span {
  color: #577783;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.field-help {
  margin-top: 7px;
  color: #647e89;
  font-size: 11px;
  line-height: 1.35;
}

.field-example {
  margin-top: 3px;
  color: #2c8ba4;
  font-size: 10px;
  font-style: italic;
  line-height: 1.35;
}

.parameter-block {
  position: relative;
  z-index: 1;
  margin-top: 22px;
  padding: 0 16px 18px;
  border: 1px solid #c0d8df;
  border-radius: 5px;
  background: rgba(243, 249, 250, 0.72);
}

.parameter-block summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 56px;
  cursor: pointer;
  color: #173a4b;
  list-style: none;
}

.parameter-block summary::-webkit-details-marker {
  display: none;
}

.parameter-block summary span {
  font-weight: 800;
}

.parameter-block summary b {
  margin-right: 9px;
  color: #0795b6;
  font-family: "Courier New", monospace;
}

.parameter-block summary small {
  color: #66808c;
  font-size: 10px;
}

.parameter-block > p {
  margin: -3px 0 0;
  color: #5e7b88;
  font-size: 12px;
}

.error-box {
  position: relative;
  z-index: 1;
  margin-top: 20px;
  padding: 14px 18px;
  border: 1px solid #d7747a;
  background: #fff0f1;
  color: #7d242a;
  font-size: 12px;
}

.error-box ul {
  margin: 6px 0 0 18px;
  padding: 0;
}

.panel-actions {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #bed4db;
}

.panel-actions > span {
  max-width: 460px;
  color: #607b87;
  font-size: 11px;
  line-height: 1.4;
}

.panel-actions > span i {
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-right: 5px;
  border: 1px solid #2898b5;
  border-radius: 50%;
  color: #177f9a;
  font-style: normal;
}

.primary-button,
.secondary-button,
.ghost-button,
.pdf-button {
  border: 0;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.primary-button {
  min-height: 50px;
  padding: 0 24px;
  border: 1px solid #09a9c7;
  border-radius: 3px;
  background: linear-gradient(90deg, #18c7e4, #0ec0dc);
  color: #052c3c;
  font-weight: 800;
  box-shadow: 0 10px 25px rgba(0, 169, 204, 0.22);
}

.primary-button b {
  margin-left: 18px;
  font-size: 18px;
}

.primary-button:hover,
.secondary-button:hover,
.pdf-button:hover {
  transform: translateY(-2px);
}

.secondary-button {
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid #4ea9be;
  border-radius: 3px;
  background: #effbfc;
  color: #0d6078;
  font-size: 12px;
  font-weight: 800;
}

.ghost-button {
  min-height: 46px;
  padding: 0 16px;
  border: 1px solid rgba(180, 224, 235, 0.55);
  border-radius: 3px;
  background: rgba(5, 47, 69, 0.6);
  color: #d6edf3;
  font-weight: 700;
}

.large {
  min-height: 58px;
  width: 100%;
}

.processing-panel {
  display: grid;
  grid-template-columns: 190px 1fr;
  gap: 38px;
  align-items: center;
  max-width: 900px;
  min-height: 300px;
  margin: 90px auto;
  padding: 45px;
  border: 1px solid rgba(78, 178, 204, 0.55);
  background: rgba(2, 35, 52, 0.84);
  box-shadow: var(--shadow);
}

.processing-orbit {
  display: grid;
  place-items: center;
  width: 160px;
  height: 160px;
  border: 2px solid var(--cyan);
  border-radius: 50%;
  box-shadow: inset 0 0 0 14px rgba(8, 200, 232, 0.05), 0 0 45px rgba(8, 200, 232, 0.15);
  animation: pulse 1.5s ease-in-out infinite;
}

.processing-orbit span {
  color: white;
  font-family: "Courier New", monospace;
  font-size: 35px;
  font-weight: 800;
}

@keyframes pulse {
  50% {
    box-shadow: inset 0 0 0 20px rgba(8, 200, 232, 0.08), 0 0 70px rgba(8, 200, 232, 0.26);
  }
}

.processing-copy h3 {
  margin: 10px 0 20px;
  color: white;
  font-size: 30px;
}

.processing-copy p {
  color: rgba(218, 238, 243, 0.72);
  font-size: 12px;
}

.progress-track {
  height: 10px;
  overflow: hidden;
  border: 1px solid rgba(83, 184, 210, 0.52);
  background: rgba(0, 12, 20, 0.5);
}

.progress-track span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #05a7c8, #20d9ef);
  transition: width 0.3s ease;
}

.metric-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin: 28px 0 22px;
}

.metric-strip article {
  position: relative;
  min-height: 135px;
  padding: 22px;
  overflow: hidden;
  border: 1px solid rgba(126, 199, 218, 0.46);
  background: rgba(3, 45, 64, 0.78);
}

.metric-strip article::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--cyan);
}

.metric-strip span,
.metric-strip small {
  display: block;
  color: rgba(216, 238, 243, 0.75);
}

.metric-strip span {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.metric-strip strong {
  display: block;
  margin: 10px 0 7px;
  color: white;
  font-size: 33px;
}

.metric-strip small {
  font-size: 11px;
}

.two-column {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.7fr);
  gap: 20px;
}

.data-panel,
.explanation-card,
.comparison-panel,
.priorities-panel,
.results-grid > .blueprint-panel {
  padding: 28px;
}

.explanation-card {
  min-height: 350px;
}

.explanation-card h2 {
  margin: 10px 0 15px;
  font-size: 25px;
}

.explanation-card p {
  color: #4f6d7a;
  font-size: 14px;
  line-height: 1.6;
}

.check-list {
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.check-list li {
  margin: 10px 0;
  color: #315466;
  font-size: 13px;
}

.check-list li::before {
  content: "✓";
  margin-right: 8px;
  color: #0b9e7c;
  font-weight: 800;
}

.table-scroll {
  position: relative;
  z-index: 1;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  color: #294b5b;
  font-size: 12px;
}

th {
  padding: 11px 10px;
  border-bottom: 2px solid #6db4c6;
  color: #16475c;
  text-align: left;
  white-space: nowrap;
}

td {
  padding: 11px 10px;
  border-bottom: 1px solid #d2e3e8;
}

tbody tr:hover {
  background: rgba(211, 243, 248, 0.5);
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
  white-space: nowrap;
}

.status.safe,
.status.bajo {
  background: #dcf5eb;
  color: #16785c;
}

.status.danger,
.status.alto {
  background: #ffe1e3;
  color: #a42d36;
}

.status.medio {
  background: #fff1d8;
  color: #976013;
}

.stage-actions {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-top: 28px;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.model-card {
  position: relative;
  min-height: 330px;
  padding: 28px;
  overflow: hidden;
  border: 1px solid rgba(126, 199, 218, 0.5);
  background: rgba(3, 47, 68, 0.86);
  color: white;
  text-align: left;
  transition: border 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.model-card:hover {
  transform: translateY(-3px);
  border-color: var(--cyan);
}

.model-card.selected {
  border: 2px solid var(--cyan);
  background: linear-gradient(145deg, rgba(6, 73, 99, 0.95), rgba(2, 44, 62, 0.94));
  box-shadow: 0 0 0 4px rgba(8, 200, 232, 0.11);
}

.model-index {
  color: #7dd7e9;
  font-family: "Courier New", monospace;
  font-size: 11px;
}

.model-symbol {
  display: grid;
  place-items: center;
  width: 67px;
  height: 67px;
  margin: 30px 0 22px;
  border: 1px solid #43acc5;
  color: var(--cyan);
  font-family: "Courier New", monospace;
  font-size: 37px;
}

.model-card h2 {
  margin: 0 0 12px;
  font-size: 25px;
}

.model-card p {
  min-height: 58px;
  margin: 0 0 12px;
  color: rgba(222, 239, 244, 0.8);
  font-size: 13px;
  line-height: 1.5;
}

.model-card small {
  display: block;
  color: #8fc9d7;
  font-size: 11px;
  line-height: 1.45;
}

.model-card i {
  position: absolute;
  right: 20px;
  bottom: 17px;
  color: var(--cyan);
  font-size: 10px;
  font-style: normal;
  font-weight: 800;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.arena-actions {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 30px;
  align-items: center;
  margin-top: 22px;
  padding: 30px;
}

.arena-actions h2 {
  margin: 8px 0 8px;
  font-size: 25px;
}

.arena-actions p {
  max-width: 650px;
  margin: 0;
  color: #5b7581;
  font-size: 13px;
  line-height: 1.5;
}

.button-stack {
  display: grid;
  grid-template-columns: 1fr;
  gap: 9px;
}

.result-hero {
  display: grid;
  grid-template-columns: 1.1fr 0.65fr 0.8fr;
  gap: 24px;
  align-items: center;
  padding: 32px;
}

.result-hero h2 {
  margin: 8px 0 10px;
  font-size: 31px;
}

.result-hero p {
  max-width: 500px;
  margin: 0;
  color: #56737f;
  font-size: 13px;
  line-height: 1.5;
}

.run-id {
  display: inline-block;
  margin-top: 16px;
  color: #0b86a5;
  font-family: "Courier New", monospace;
  font-size: 10px;
}

.result-gauge {
  padding: 10px 22px;
  border-left: 1px solid #b6d5dd;
}

.result-gauge strong,
.result-gauge span,
.result-gauge small {
  display: block;
}

.result-gauge strong {
  color: #067f9e;
  font-size: 40px;
}

.result-gauge span {
  margin: 4px 0;
  color: #173f51;
  font-weight: 800;
}

.result-gauge small {
  color: #78909a;
  font-size: 10px;
}

.pdf-button {
  display: grid;
  grid-template-columns: 62px 1fr;
  grid-template-rows: 1fr 1fr;
  align-items: center;
  min-height: 84px;
  padding: 13px;
  border: 1px solid #04a9ca;
  background: #063f58;
  color: white;
  text-align: left;
}

.pdf-button span {
  grid-row: 1 / 3;
  display: grid;
  place-items: center;
  width: 50px;
  height: 56px;
  border: 1px solid #20cde7;
  color: var(--cyan);
  font-family: "Courier New", monospace;
  font-size: 14px;
  font-weight: 800;
}

.pdf-button b {
  font-size: 12px;
}

.pdf-button i {
  color: #8fc8d5;
  font-size: 9px;
  font-style: normal;
}

.metric-strip.results article {
  background: rgba(3, 45, 64, 0.85);
}

.comparison-panel,
.priorities-panel {
  margin-top: 20px;
}

.winner-row {
  background: #dff8fb;
  font-weight: 800;
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.stress-list,
.importance-list {
  position: relative;
  z-index: 1;
}

.stress-list > div,
.importance-list > div {
  display: grid;
  grid-template-columns: 1.35fr 1fr 54px;
  gap: 10px;
  align-items: center;
  margin: 12px 0;
  color: #365766;
  font-size: 11px;
}

.stress-list span small {
  display: block;
  margin-top: 2px;
  color: #83969e;
  font-size: 9px;
}

.stress-list div > div,
.importance-list div > div {
  height: 8px;
  overflow: hidden;
  background: #d8e9ed;
}

.stress-list i,
.importance-list i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #0ba9c9, #18d0e7);
}

.stress-list strong,
.importance-list strong {
  color: #17495d;
  text-align: right;
}

footer {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 32px;
  border-top: 1px solid rgba(145, 209, 224, 0.25);
  background: rgba(2, 28, 43, 0.72);
  color: rgba(196, 226, 233, 0.57);
  font-size: 10px;
}

@media (max-width: 1180px) {
  .content-wrap {
    width: min(1040px, calc(100% - 48px));
  }

  .technical-mark {
    display: none;
  }

  .stepper button {
    min-width: 120px;
  }

  .stepper button em {
    display: none;
  }

  .layout-with-guide {
    grid-template-columns: 1fr;
  }

  .guide-panel {
    position: relative;
    top: auto;
  }

  .arena-actions,
  .result-hero {
    grid-template-columns: 1fr 1fr;
  }

  .result-hero > div:first-child {
    grid-column: 1 / 3;
  }
}

@media (max-width: 780px) {
  .topbar {
    padding: 0 16px;
    min-height: 68px;
  }

  .brand {
    font-size: 18px;
  }

  .stepper {
    gap: 0;
  }

  .stepper button {
    min-width: 45px;
    padding: 0 5px;
  }

  .stepper button span {
    width: 29px;
    height: 29px;
    font-size: 12px;
  }

  .content-wrap {
    width: min(100% - 24px, 680px);
    padding-top: 38px;
  }

  .stage-heading h1 {
    font-size: 40px;
    letter-spacing: -1.6px;
  }

  .stage-heading p {
    font-size: 14px;
  }

  .main-panel,
  .guide-panel,
  .data-panel,
  .explanation-card,
  .comparison-panel,
  .priorities-panel,
  .results-grid > .blueprint-panel {
    padding: 22px;
  }

  .field-grid,
  .metric-strip,
  .two-column,
  .model-grid,
  .arena-actions,
  .result-hero,
  .results-grid {
    grid-template-columns: 1fr;
  }

  .result-hero > div:first-child {
    grid-column: auto;
  }

  .metric-strip {
    grid-template-columns: 1fr 1fr;
  }

  .panel-title,
  .panel-actions,
  .stage-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .panel-title p {
    text-align: left;
  }

  .processing-panel {
    grid-template-columns: 1fr;
    margin: 25px auto;
    padding: 30px;
  }

  .processing-orbit {
    width: 120px;
    height: 120px;
  }

  .button-stack {
    width: 100%;
  }

  footer {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .metric-strip {
    grid-template-columns: 1fr;
  }

  .field-heading {
    align-items: flex-start;
  }

  .parameter-block summary {
    align-items: flex-start;
    flex-direction: column;
    padding: 12px 0;
  }
}
