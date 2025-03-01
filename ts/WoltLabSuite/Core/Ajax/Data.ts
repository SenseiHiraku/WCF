/**
 * @woltlabExcludeBundle all
 */

export interface RequestPayload {
  [key: string]: any;
}

export interface DatabaseObjectActionPayload extends RequestPayload {
  actionName: string;
  className: string;
  interfaceName?: string;
  objectIDs?: number[];
  parameters?: {
    [key: string]: any;
  };
}

export type RequestData = FormData | RequestPayload | DatabaseObjectActionPayload;

export interface ResponseData {
  [key: string]: any;
}

export interface DatabaseObjectActionResponse extends ResponseData {
  actionName: string;
  objectIDs: number[];
  returnValues:
    | {
        [key: string]: any;
      }
    | any[];
}

/** Return `false` to suppress the error message. */
export type CallbackFailure = (
  data: ResponseData,
  responseText: string,
  xhr: XMLHttpRequest,
  requestData: RequestData,
) => boolean;
export type CallbackFinalize = (xhr: XMLHttpRequest) => void;
export type CallbackProgress = (event: ProgressEvent) => void;
export type CallbackSuccess = (
  data: ResponseData | DatabaseObjectActionResponse,
  responseText: string,
  xhr: XMLHttpRequest,
  requestData: RequestData,
) => void;
export type CallbackUploadProgress = (event: ProgressEvent) => void;
export type AjaxCallbackSetup = () => RequestOptions;

export interface AjaxCallbackObject {
  _ajaxFailure?: CallbackFailure;
  _ajaxFinalize?: CallbackFinalize;
  _ajaxProgress?: CallbackProgress;
  _ajaxSuccess: CallbackSuccess;
  _ajaxUploadProgress?: CallbackUploadProgress;
  _ajaxSetup: AjaxCallbackSetup;
}

export interface RequestOptions {
  // request data
  data?: RequestData;
  contentType?: string | false;
  responseType?: string;
  type?: string;
  url?: string;
  withCredentials?: boolean;

  // behavior
  autoAbort?: boolean;
  ignoreError?: boolean;
  pinData?: boolean;
  silent?: boolean;
  includeRequestedWith?: boolean;

  // callbacks
  failure?: CallbackFailure;
  finalize?: CallbackFinalize;
  success?: CallbackSuccess;
  progress?: CallbackProgress;
  uploadProgress?: CallbackUploadProgress;

  callbackObject?: AjaxCallbackObject | null;
}

interface PreviousException {
  message: string;
  stacktrace: string;
}

export interface AjaxResponseException extends ResponseData {
  exceptionID?: string;
  previous: PreviousException[];
  file?: string;
  line?: number;
  message: string;
  returnValues?: {
    description?: string;
  };
  stacktrace?: string;
}
