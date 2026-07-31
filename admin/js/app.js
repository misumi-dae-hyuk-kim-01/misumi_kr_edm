import { registerRoute, startRouter } from "./router.js";
import { renderCampaigns } from "./views/campaigns.js";
import { renderGenerator } from "./views/generator.js";
import { renderGeneratorLP } from "./views/generatorLP.js";
import { renderAssets } from "./views/assets.js";
import { renderTemplates } from "./views/templates.js";

registerRoute("campaigns", renderCampaigns);         // 화면 01
registerRoute("generator", renderGenerator);         // EDM 생성기
registerRoute("generator-lp", renderGeneratorLP);    // LP 생성기
registerRoute("assets", renderAssets);               // 화면 04
registerRoute("templates", renderTemplates);         // 화면 05

startRouter();

// 사이드바의 "+ 새 캠페인" 드롭다운. 사이드바는 라우트가 바뀌어도 다시 그려지지 않는
// 영역(#content만 교체됨)이라, 여기서 한 번만 이벤트를 걸어두면 됩니다.
const sbNewBtn = document.getElementById("sb-new-btn");
const sbNewMenu = document.getElementById("sb-new-menu");
if (sbNewBtn && sbNewMenu) {
  sbNewBtn.addEventListener("click", e => {
    e.stopPropagation();
    sbNewMenu.classList.toggle("open");
  });
  document.addEventListener("click", () => sbNewMenu.classList.remove("open"));
  sbNewMenu.addEventListener("click", () => sbNewMenu.classList.remove("open"));
}
