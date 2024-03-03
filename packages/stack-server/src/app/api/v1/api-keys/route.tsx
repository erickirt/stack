import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import { StatusError } from "stack-shared/dist/utils/errors";
import { parseRequest, smartRouteHandler } from "@/lib/route-handlers";
import { checkApiKeySet, createApiKeySet, listApiKeySets, superSecretAdminKeyHeaderSchema } from "@/lib/api-keys";
import { isProjectAdmin } from "@/lib/projects";

const getSchema = yup.object({
  headers: yup.object({
    "x-stack-super-secret-admin-key": superSecretAdminKeyHeaderSchema.default(""),
    "x-stack-admin-access-token": yup.string().default(""),
    "x-stack-project-id": yup.string().required(),
  }).required(),
});

export const GET = smartRouteHandler(async (req: NextRequest) => {
  const {
    headers: {
      "x-stack-project-id": projectId,
      "x-stack-super-secret-admin-key": superSecretAdminKey,
      "x-stack-admin-access-token": adminAccessToken,
    },
  } = await parseRequest(req, getSchema);

  if (!await checkApiKeySet(projectId, { superSecretAdminKey }) && !await isProjectAdmin(projectId, adminAccessToken)) {
    throw new StatusError(StatusError.Forbidden);
  }

  const apiKeys = await listApiKeySets(
    projectId,
  );

  return NextResponse.json(apiKeys);
});

const postSchema = yup.object({
  headers: yup.object({
    "x-stack-super-secret-admin-key": superSecretAdminKeyHeaderSchema.default(""),
    "x-stack-admin-access-token": yup.string().default(""),
    "x-stack-project-id": yup.string().required(),
  }).required(),
  body: yup.object({
    description: yup.string().required(),
    expiresAt: yup.date().required(),
    hasPublishableClientKey: yup.boolean().required(),
    hasSecretServerKey: yup.boolean().required(),
    hasSuperSecretAdminKey: yup.boolean().required(),
  }).required(),
});

export const POST = smartRouteHandler(async (req: NextRequest) => {
  const {
    headers: {
      "x-stack-project-id": projectId,
      "x-stack-super-secret-admin-key": superSecretAdminKey,
      "x-stack-admin-access-token": adminAccessToken,
    },
    body: {
      description,
      expiresAt,
      hasPublishableClientKey,
      hasSecretServerKey,
      hasSuperSecretAdminKey,
    },
  } = await parseRequest(req, postSchema);

  if (!await checkApiKeySet(projectId, { superSecretAdminKey }) && !await isProjectAdmin(projectId, adminAccessToken)) {
    throw new StatusError(StatusError.Forbidden);
  }

  const created = await createApiKeySet(
    projectId,
    description,
    expiresAt,
    !!hasPublishableClientKey,
    !!hasSecretServerKey,
    !!hasSuperSecretAdminKey,
  );

  return NextResponse.json(created);
});