import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "SyncOffset",
  version: packageJson.version,
  copyright: `© ${currentYear}, SyncOffset.`,
  meta: {
    title: "SyncOffset — Production Office + Dispatch Infrastructure",
    description:
      "SyncOffset is production office and dispatch infrastructure software for film and television. Transport coordination, document custody, crew logistics, and departmental accountability.",
  },
};
