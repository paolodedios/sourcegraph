// @generated by protoc-gen-es v1.10.0 with parameter "target=ts"
// @generated from file codyaccess.proto (package enterpriseportal.codyaccess.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Duration, FieldMask, Message, proto3, protoInt64, Timestamp } from "@bufbuild/protobuf";

/**
 * @generated from enum enterpriseportal.codyaccess.v1.CodyGatewayRateLimitSource
 */
export enum CodyGatewayRateLimitSource {
  /**
   * @generated from enum value: CODY_GATEWAY_RATE_LIMIT_SOURCE_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * Indicates that a custom override for the rate limit has been configured
   * and applied.
   *
   * @generated from enum value: CODY_GATEWAY_RATE_LIMIT_SOURCE_OVERRIDE = 1;
   */
  OVERRIDE = 1,

  /**
   * Indicates that the rate limit is inferred by the subscription's active plan.
   *
   * @generated from enum value: CODY_GATEWAY_RATE_LIMIT_SOURCE_PLAN = 2;
   */
  PLAN = 2,
}
// Retrieve enum metadata with: proto3.getEnumType(CodyGatewayRateLimitSource)
proto3.util.setEnumType(CodyGatewayRateLimitSource, "enterpriseportal.codyaccess.v1.CodyGatewayRateLimitSource", [
  { no: 0, name: "CODY_GATEWAY_RATE_LIMIT_SOURCE_UNSPECIFIED" },
  { no: 1, name: "CODY_GATEWAY_RATE_LIMIT_SOURCE_OVERRIDE" },
  { no: 2, name: "CODY_GATEWAY_RATE_LIMIT_SOURCE_PLAN" },
]);

/**
 * @generated from message enterpriseportal.codyaccess.v1.GetCodyGatewayAccessRequest
 */
export class GetCodyGatewayAccessRequest extends Message<GetCodyGatewayAccessRequest> {
  /**
   * @generated from oneof enterpriseportal.codyaccess.v1.GetCodyGatewayAccessRequest.query
   */
  query: {
    /**
     * The external, prefixed UUID-format identifier of an Enterprise subscription.
     *
     * @generated from field: string subscription_id = 1;
     */
    value: string;
    case: "subscriptionId";
  } | {
    /**
     * An license-based access token that is valid for an Enterprise subscription's
     * Cody Gateway access, e.g. 'slk_...'
     *
     * @generated from field: string access_token = 2;
     */
    value: string;
    case: "accessToken";
  } | { case: undefined; value?: undefined } = { case: undefined };

  constructor(data?: PartialMessage<GetCodyGatewayAccessRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "enterpriseportal.codyaccess.v1.GetCodyGatewayAccessRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "subscription_id", kind: "scalar", T: 9 /* ScalarType.STRING */, oneof: "query" },
    { no: 2, name: "access_token", kind: "scalar", T: 9 /* ScalarType.STRING */, oneof: "query" },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetCodyGatewayAccessRequest {
    return new GetCodyGatewayAccessRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetCodyGatewayAccessRequest {
    return new GetCodyGatewayAccessRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetCodyGatewayAccessRequest {
    return new GetCodyGatewayAccessRequest().fromJsonString(jsonString, options);
  }

  static equals(a: GetCodyGatewayAccessRequest | PlainMessage<GetCodyGatewayAccessRequest> | undefined, b: GetCodyGatewayAccessRequest | PlainMessage<GetCodyGatewayAccessRequest> | undefined): boolean {
    return proto3.util.equals(GetCodyGatewayAccessRequest, a, b);
  }
}

/**
 * @generated from message enterpriseportal.codyaccess.v1.GetCodyGatewayAccessResponse
 */
export class GetCodyGatewayAccessResponse extends Message<GetCodyGatewayAccessResponse> {
  /**
   * @generated from field: enterpriseportal.codyaccess.v1.CodyGatewayAccess access = 1;
   */
  access?: CodyGatewayAccess;

  constructor(data?: PartialMessage<GetCodyGatewayAccessResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "enterpriseportal.codyaccess.v1.GetCodyGatewayAccessResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "access", kind: "message", T: CodyGatewayAccess },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetCodyGatewayAccessResponse {
    return new GetCodyGatewayAccessResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetCodyGatewayAccessResponse {
    return new GetCodyGatewayAccessResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetCodyGatewayAccessResponse {
    return new GetCodyGatewayAccessResponse().fromJsonString(jsonString, options);
  }

  static equals(a: GetCodyGatewayAccessResponse | PlainMessage<GetCodyGatewayAccessResponse> | undefined, b: GetCodyGatewayAccessResponse | PlainMessage<GetCodyGatewayAccessResponse> | undefined): boolean {
    return proto3.util.equals(GetCodyGatewayAccessResponse, a, b);
  }
}

/**
 * @generated from message enterpriseportal.codyaccess.v1.CodyGatewayRateLimit
 */
export class CodyGatewayRateLimit extends Message<CodyGatewayRateLimit> {
  /**
   * The source of the rate limit configuration.
   *
   * @generated from field: enterpriseportal.codyaccess.v1.CodyGatewayRateLimitSource source = 1;
   */
  source = CodyGatewayRateLimitSource.UNSPECIFIED;

  /**
   * Requests per time interval.
   *
   * @generated from field: uint64 limit = 2;
   */
  limit = protoInt64.zero;

  /**
   * Interval for rate limiting.
   *
   * @generated from field: google.protobuf.Duration interval_duration = 3;
   */
  intervalDuration?: Duration;

  constructor(data?: PartialMessage<CodyGatewayRateLimit>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "enterpriseportal.codyaccess.v1.CodyGatewayRateLimit";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "source", kind: "enum", T: proto3.getEnumType(CodyGatewayRateLimitSource) },
    { no: 2, name: "limit", kind: "scalar", T: 4 /* ScalarType.UINT64 */ },
    { no: 3, name: "interval_duration", kind: "message", T: Duration },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CodyGatewayRateLimit {
    return new CodyGatewayRateLimit().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CodyGatewayRateLimit {
    return new CodyGatewayRateLimit().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CodyGatewayRateLimit {
    return new CodyGatewayRateLimit().fromJsonString(jsonString, options);
  }

  static equals(a: CodyGatewayRateLimit | PlainMessage<CodyGatewayRateLimit> | undefined, b: CodyGatewayRateLimit | PlainMessage<CodyGatewayRateLimit> | undefined): boolean {
    return proto3.util.equals(CodyGatewayRateLimit, a, b);
  }
}

/**
 * @generated from message enterpriseportal.codyaccess.v1.CodyGatewayAccessToken
 */
export class CodyGatewayAccessToken extends Message<CodyGatewayAccessToken> {
  /**
   * Access token for authenticating as the subscription holder with managed
   * Sourcegraph services.
   *
   * @generated from field: string token = 1;
   */
  token = "";

  constructor(data?: PartialMessage<CodyGatewayAccessToken>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "enterpriseportal.codyaccess.v1.CodyGatewayAccessToken";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "token", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CodyGatewayAccessToken {
    return new CodyGatewayAccessToken().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CodyGatewayAccessToken {
    return new CodyGatewayAccessToken().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CodyGatewayAccessToken {
    return new CodyGatewayAccessToken().fromJsonString(jsonString, options);
  }

  static equals(a: CodyGatewayAccessToken | PlainMessage<CodyGatewayAccessToken> | undefined, b: CodyGatewayAccessToken | PlainMessage<CodyGatewayAccessToken> | undefined): boolean {
    return proto3.util.equals(CodyGatewayAccessToken, a, b);
  }
}

/**
 * @generated from message enterpriseportal.codyaccess.v1.CodyGatewayAccess
 */
export class CodyGatewayAccess extends Message<CodyGatewayAccess> {
  /**
   * The external, prefixed UUID-format identifier for the Enterprise
   * subscription corresponding to this Cody Gateway access description
   * (e.g. "es_...").
   *
   * @generated from field: string subscription_id = 1;
   */
  subscriptionId = "";

  /**
   * Whether or not a subscription has Cody Gateway access enabled.
   *
   * @generated from field: bool enabled = 2;
   */
  enabled = false;

  /**
   * Rate limit for chat completions access, or null if not enabled.
   *
   * @generated from field: optional enterpriseportal.codyaccess.v1.CodyGatewayRateLimit chat_completions_rate_limit = 3;
   */
  chatCompletionsRateLimit?: CodyGatewayRateLimit;

  /**
   * Rate limit for code completions access, or null if not enabled.
   *
   * @generated from field: optional enterpriseportal.codyaccess.v1.CodyGatewayRateLimit code_completions_rate_limit = 4;
   */
  codeCompletionsRateLimit?: CodyGatewayRateLimit;

  /**
   * Rate limit for embedding text chunks, or null if not enabled.
   *
   * @generated from field: optional enterpriseportal.codyaccess.v1.CodyGatewayRateLimit embeddings_rate_limit = 5;
   */
  embeddingsRateLimit?: CodyGatewayRateLimit;

  /**
   * Available access tokens for authenticating as the subscription holder with
   * Cody Gateway.
   *
   * @generated from field: repeated enterpriseportal.codyaccess.v1.CodyGatewayAccessToken access_tokens = 6;
   */
  accessTokens: CodyGatewayAccessToken[] = [];

  /**
   * The display name of the corresponding Enterprise subscription.
   *
   * @generated from field: string subscription_display_name = 7;
   */
  subscriptionDisplayName = "";

  constructor(data?: PartialMessage<CodyGatewayAccess>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "enterpriseportal.codyaccess.v1.CodyGatewayAccess";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "subscription_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "enabled", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 3, name: "chat_completions_rate_limit", kind: "message", T: CodyGatewayRateLimit, opt: true },
    { no: 4, name: "code_completions_rate_limit", kind: "message", T: CodyGatewayRateLimit, opt: true },
    { no: 5, name: "embeddings_rate_limit", kind: "message", T: CodyGatewayRateLimit, opt: true },
    { no: 6, name: "access_tokens", kind: "message", T: CodyGatewayAccessToken, repeated: true },
    { no: 7, name: "subscription_display_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CodyGatewayAccess {
    return new CodyGatewayAccess().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CodyGatewayAccess {
    return new CodyGatewayAccess().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CodyGatewayAccess {
    return new CodyGatewayAccess().fromJsonString(jsonString, options);
  }

  static equals(a: CodyGatewayAccess | PlainMessage<CodyGatewayAccess> | undefined, b: CodyGatewayAccess | PlainMessage<CodyGatewayAccess> | undefined): boolean {
    return proto3.util.equals(CodyGatewayAccess, a, b);
  }
}

/**
 * @generated from message enterpriseportal.codyaccess.v1.ListCodyGatewayAccessesRequest
 */
export class ListCodyGatewayAccessesRequest extends Message<ListCodyGatewayAccessesRequest> {
  /**
   * Clients use this field to specify the maximum number of results to be
   * returned by the server. The server may further constrain the maximum number
   * of results returned in a single page. If the page_size is 0, the server
   * will decide the number of results to be returned.
   *
   * See pagination concepts from https://cloud.google.com/apis/design/design_patterns#list_pagination
   *
   * @generated from field: int32 page_size = 1;
   */
  pageSize = 0;

  /**
   * The client uses this field to request a specific page of the list results.
   *
   * See pagination concepts from https://cloud.google.com/apis/design/design_patterns#list_pagination
   *
   * @generated from field: string page_token = 2;
   */
  pageToken = "";

  constructor(data?: PartialMessage<ListCodyGatewayAccessesRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "enterpriseportal.codyaccess.v1.ListCodyGatewayAccessesRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "page_size", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
    { no: 2, name: "page_token", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ListCodyGatewayAccessesRequest {
    return new ListCodyGatewayAccessesRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ListCodyGatewayAccessesRequest {
    return new ListCodyGatewayAccessesRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ListCodyGatewayAccessesRequest {
    return new ListCodyGatewayAccessesRequest().fromJsonString(jsonString, options);
  }

  static equals(a: ListCodyGatewayAccessesRequest | PlainMessage<ListCodyGatewayAccessesRequest> | undefined, b: ListCodyGatewayAccessesRequest | PlainMessage<ListCodyGatewayAccessesRequest> | undefined): boolean {
    return proto3.util.equals(ListCodyGatewayAccessesRequest, a, b);
  }
}

/**
 * @generated from message enterpriseportal.codyaccess.v1.ListCodyGatewayAccessesResponse
 */
export class ListCodyGatewayAccessesResponse extends Message<ListCodyGatewayAccessesResponse> {
  /**
   * This field represents the pagination token to retrieve the next page of
   * results. If the value is "", it means no further results for the request.
   *
   * @generated from field: string next_page_token = 1;
   */
  nextPageToken = "";

  /**
   * The list of Cody Gateway access that matched the given query.
   *
   * @generated from field: repeated enterpriseportal.codyaccess.v1.CodyGatewayAccess accesses = 2;
   */
  accesses: CodyGatewayAccess[] = [];

  constructor(data?: PartialMessage<ListCodyGatewayAccessesResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "enterpriseportal.codyaccess.v1.ListCodyGatewayAccessesResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "next_page_token", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "accesses", kind: "message", T: CodyGatewayAccess, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ListCodyGatewayAccessesResponse {
    return new ListCodyGatewayAccessesResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ListCodyGatewayAccessesResponse {
    return new ListCodyGatewayAccessesResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ListCodyGatewayAccessesResponse {
    return new ListCodyGatewayAccessesResponse().fromJsonString(jsonString, options);
  }

  static equals(a: ListCodyGatewayAccessesResponse | PlainMessage<ListCodyGatewayAccessesResponse> | undefined, b: ListCodyGatewayAccessesResponse | PlainMessage<ListCodyGatewayAccessesResponse> | undefined): boolean {
    return proto3.util.equals(ListCodyGatewayAccessesResponse, a, b);
  }
}

/**
 * @generated from message enterpriseportal.codyaccess.v1.UpdateCodyGatewayAccessRequest
 */
export class UpdateCodyGatewayAccessRequest extends Message<UpdateCodyGatewayAccessRequest> {
  /**
   * The Cody Gateway access to update. See `update_mask` for the fields that
   * can be updated.
   *
   * The following fields are used to identify the Cody Gateway access to update:
   *  - subscription_id
   * Multiple fields are treated as AND-concatenated.
   *
   * @generated from field: enterpriseportal.codyaccess.v1.CodyGatewayAccess access = 1;
   */
  access?: CodyGatewayAccess;

  /**
   * The list of fields to update, fields are specified relative to the CodyGatewayAccess.
   * Updatable fields are:
   *  - enabled
   *  - chat_completions_rate_limit.limit
   *  - chat_completions_rate_limit.interval_duration
   *  - code_completions_rate_limit.limit
   *  - code_completions_rate_limit.interval_duration
   *  - embeddings_rate_limit.limit
   *  - embeddings_rate_limit.interval_duration
   * An omitted `update_mask` implies that all populated fields are updated.
   *
   * @generated from field: google.protobuf.FieldMask update_mask = 2;
   */
  updateMask?: FieldMask;

  constructor(data?: PartialMessage<UpdateCodyGatewayAccessRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "enterpriseportal.codyaccess.v1.UpdateCodyGatewayAccessRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "access", kind: "message", T: CodyGatewayAccess },
    { no: 2, name: "update_mask", kind: "message", T: FieldMask },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): UpdateCodyGatewayAccessRequest {
    return new UpdateCodyGatewayAccessRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): UpdateCodyGatewayAccessRequest {
    return new UpdateCodyGatewayAccessRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): UpdateCodyGatewayAccessRequest {
    return new UpdateCodyGatewayAccessRequest().fromJsonString(jsonString, options);
  }

  static equals(a: UpdateCodyGatewayAccessRequest | PlainMessage<UpdateCodyGatewayAccessRequest> | undefined, b: UpdateCodyGatewayAccessRequest | PlainMessage<UpdateCodyGatewayAccessRequest> | undefined): boolean {
    return proto3.util.equals(UpdateCodyGatewayAccessRequest, a, b);
  }
}

/**
 * @generated from message enterpriseportal.codyaccess.v1.UpdateCodyGatewayAccessResponse
 */
export class UpdateCodyGatewayAccessResponse extends Message<UpdateCodyGatewayAccessResponse> {
  /**
   * The updated Cody Gateway access.
   *
   * @generated from field: enterpriseportal.codyaccess.v1.CodyGatewayAccess access = 1;
   */
  access?: CodyGatewayAccess;

  constructor(data?: PartialMessage<UpdateCodyGatewayAccessResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "enterpriseportal.codyaccess.v1.UpdateCodyGatewayAccessResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "access", kind: "message", T: CodyGatewayAccess },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): UpdateCodyGatewayAccessResponse {
    return new UpdateCodyGatewayAccessResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): UpdateCodyGatewayAccessResponse {
    return new UpdateCodyGatewayAccessResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): UpdateCodyGatewayAccessResponse {
    return new UpdateCodyGatewayAccessResponse().fromJsonString(jsonString, options);
  }

  static equals(a: UpdateCodyGatewayAccessResponse | PlainMessage<UpdateCodyGatewayAccessResponse> | undefined, b: UpdateCodyGatewayAccessResponse | PlainMessage<UpdateCodyGatewayAccessResponse> | undefined): boolean {
    return proto3.util.equals(UpdateCodyGatewayAccessResponse, a, b);
  }
}

/**
 * @generated from message enterpriseportal.codyaccess.v1.GetCodyGatewayUsageRequest
 */
export class GetCodyGatewayUsageRequest extends Message<GetCodyGatewayUsageRequest> {
  /**
   * @generated from oneof enterpriseportal.codyaccess.v1.GetCodyGatewayUsageRequest.query
   */
  query: {
    /**
     * The external, prefixed UUID-format identifier of an Enterprise subscription.
     *
     * @generated from field: string subscription_id = 1;
     */
    value: string;
    case: "subscriptionId";
  } | { case: undefined; value?: undefined } = { case: undefined };

  constructor(data?: PartialMessage<GetCodyGatewayUsageRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "enterpriseportal.codyaccess.v1.GetCodyGatewayUsageRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "subscription_id", kind: "scalar", T: 9 /* ScalarType.STRING */, oneof: "query" },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetCodyGatewayUsageRequest {
    return new GetCodyGatewayUsageRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetCodyGatewayUsageRequest {
    return new GetCodyGatewayUsageRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetCodyGatewayUsageRequest {
    return new GetCodyGatewayUsageRequest().fromJsonString(jsonString, options);
  }

  static equals(a: GetCodyGatewayUsageRequest | PlainMessage<GetCodyGatewayUsageRequest> | undefined, b: GetCodyGatewayUsageRequest | PlainMessage<GetCodyGatewayUsageRequest> | undefined): boolean {
    return proto3.util.equals(GetCodyGatewayUsageRequest, a, b);
  }
}

/**
 * @generated from message enterpriseportal.codyaccess.v1.CodyGatewayUsage
 */
export class CodyGatewayUsage extends Message<CodyGatewayUsage> {
  /**
   * The external, prefixed UUID-format identifier for the Enterprise
   * subscription corresponding to this Cody Gateway usage (e.g. "es_...").
   *
   * @generated from field: string subscription_id = 1;
   */
  subscriptionId = "";

  /**
   * Usage data for chat completions access, or null if not enabled.
   *
   * @generated from field: repeated enterpriseportal.codyaccess.v1.CodyGatewayUsage.UsageDatapoint chat_completions_usage = 2;
   */
  chatCompletionsUsage: CodyGatewayUsage_UsageDatapoint[] = [];

  /**
   * Usage data for code completions access, or null if not enabled.
   *
   * @generated from field: repeated enterpriseportal.codyaccess.v1.CodyGatewayUsage.UsageDatapoint code_completions_usage = 3;
   */
  codeCompletionsUsage: CodyGatewayUsage_UsageDatapoint[] = [];

  /**
   * Usage data for embedding text chunks, or null if not enabled.
   *
   * @generated from field: repeated enterpriseportal.codyaccess.v1.CodyGatewayUsage.UsageDatapoint embeddings_usage = 4;
   */
  embeddingsUsage: CodyGatewayUsage_UsageDatapoint[] = [];

  constructor(data?: PartialMessage<CodyGatewayUsage>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "enterpriseportal.codyaccess.v1.CodyGatewayUsage";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "subscription_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "chat_completions_usage", kind: "message", T: CodyGatewayUsage_UsageDatapoint, repeated: true },
    { no: 3, name: "code_completions_usage", kind: "message", T: CodyGatewayUsage_UsageDatapoint, repeated: true },
    { no: 4, name: "embeddings_usage", kind: "message", T: CodyGatewayUsage_UsageDatapoint, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CodyGatewayUsage {
    return new CodyGatewayUsage().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CodyGatewayUsage {
    return new CodyGatewayUsage().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CodyGatewayUsage {
    return new CodyGatewayUsage().fromJsonString(jsonString, options);
  }

  static equals(a: CodyGatewayUsage | PlainMessage<CodyGatewayUsage> | undefined, b: CodyGatewayUsage | PlainMessage<CodyGatewayUsage> | undefined): boolean {
    return proto3.util.equals(CodyGatewayUsage, a, b);
  }
}

/**
 * @generated from message enterpriseportal.codyaccess.v1.CodyGatewayUsage.UsageDatapoint
 */
export class CodyGatewayUsage_UsageDatapoint extends Message<CodyGatewayUsage_UsageDatapoint> {
  /**
   * The time the usage occurred. Currently the time is always the day.
   *
   * @generated from field: google.protobuf.Timestamp time = 1;
   */
  time?: Timestamp;

  /**
   * The usage for the corresponding time period.
   *
   * @generated from field: uint64 usage = 2;
   */
  usage = protoInt64.zero;

  /**
   * The model that was used.
   *
   * @generated from field: string model = 3;
   */
  model = "";

  constructor(data?: PartialMessage<CodyGatewayUsage_UsageDatapoint>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "enterpriseportal.codyaccess.v1.CodyGatewayUsage.UsageDatapoint";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "time", kind: "message", T: Timestamp },
    { no: 2, name: "usage", kind: "scalar", T: 4 /* ScalarType.UINT64 */ },
    { no: 3, name: "model", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CodyGatewayUsage_UsageDatapoint {
    return new CodyGatewayUsage_UsageDatapoint().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CodyGatewayUsage_UsageDatapoint {
    return new CodyGatewayUsage_UsageDatapoint().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CodyGatewayUsage_UsageDatapoint {
    return new CodyGatewayUsage_UsageDatapoint().fromJsonString(jsonString, options);
  }

  static equals(a: CodyGatewayUsage_UsageDatapoint | PlainMessage<CodyGatewayUsage_UsageDatapoint> | undefined, b: CodyGatewayUsage_UsageDatapoint | PlainMessage<CodyGatewayUsage_UsageDatapoint> | undefined): boolean {
    return proto3.util.equals(CodyGatewayUsage_UsageDatapoint, a, b);
  }
}

/**
 * @generated from message enterpriseportal.codyaccess.v1.GetCodyGatewayUsageResponse
 */
export class GetCodyGatewayUsageResponse extends Message<GetCodyGatewayUsageResponse> {
  /**
   * @generated from field: enterpriseportal.codyaccess.v1.CodyGatewayUsage usage = 1;
   */
  usage?: CodyGatewayUsage;

  constructor(data?: PartialMessage<GetCodyGatewayUsageResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "enterpriseportal.codyaccess.v1.GetCodyGatewayUsageResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "usage", kind: "message", T: CodyGatewayUsage },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetCodyGatewayUsageResponse {
    return new GetCodyGatewayUsageResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetCodyGatewayUsageResponse {
    return new GetCodyGatewayUsageResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetCodyGatewayUsageResponse {
    return new GetCodyGatewayUsageResponse().fromJsonString(jsonString, options);
  }

  static equals(a: GetCodyGatewayUsageResponse | PlainMessage<GetCodyGatewayUsageResponse> | undefined, b: GetCodyGatewayUsageResponse | PlainMessage<GetCodyGatewayUsageResponse> | undefined): boolean {
    return proto3.util.equals(GetCodyGatewayUsageResponse, a, b);
  }
}

