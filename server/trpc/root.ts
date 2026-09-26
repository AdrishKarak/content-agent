import { router } from "./trpc";
import { briefRouter } from "./briefRouter";
import { assetRouter } from "./assetRouter";
import { approvalRouter } from "./approvalRouter";
import { publisherRouter } from "./publisherRouter";
import { metricsRouter } from "./metricsRouter";
import { insightsRouter } from "./insightsRouter";

export const appRouter = router({
  brief: briefRouter,
  asset: assetRouter,
  approval: approvalRouter,
  publisher: publisherRouter,
  metrics: metricsRouter,
  insights: insightsRouter,
});

export type AppRouter = typeof appRouter;
