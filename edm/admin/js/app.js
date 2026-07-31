import { registerRoute, startRouter } from "./router.js";
import { renderCampaigns } from "./views/campaigns.js";
import { renderGenerator } from "./views/generator.js";
import { renderAssets } from "./views/assets.js";
import { renderTemplates } from "./views/templates.js";

registerRoute("campaigns", renderCampaigns);   // 화면 01
registerRoute("generator", renderGenerator);   // 화면 02 / 03
registerRoute("assets", renderAssets);         // 화면 04
registerRoute("templates", renderTemplates);   // 화면 05

startRouter();
