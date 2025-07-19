import protobuf from 'protobufjs';

const protoDefinition = `
syntax = "proto3";

message CodeEdit {
  string file_path = 1;
  int32 line_start = 2;
  int32 line_end = 3;
  string content = 4;
  string operation = 5; // insert, delete, replace
  int64 timestamp = 6;
  string session_id = 7;
}

message CodeContext {
  string file_path = 1;
  repeated string imports = 2;
  repeated string symbols = 3;
  map<string, string> metadata = 4;
  string language = 5;
  string framework = 6;
}

message CodeCommand {
  string type = 1; // complete, explain, refactor, debug
  CodeContext context = 2;
  string prompt = 3;
  map<string, string> options = 4;
}

message CodeResponse {
  string command_id = 1;
  oneof payload {
    CodeCompletion completion = 2;
    CodeExplanation explanation = 3;
    CodeRefactoring refactoring = 4;
    CodeDiagnostic diagnostic = 5;
  }
  int64 processing_time_ms = 6;
}

message CodeCompletion {
  repeated CompletionItem items = 1;
}

message CompletionItem {
  string text = 1;
  string label = 2;
  string detail = 3;
  float score = 4;
  string kind = 5; // function, variable, class, etc
}

message CodeExplanation {
  string summary = 1;
  repeated ExplanationSection sections = 2;
}

message ExplanationSection {
  string title = 1;
  string content = 2;
  repeated CodeReference references = 3;
}

message CodeReference {
  string file_path = 1;
  int32 line = 2;
  string preview = 3;
}

message CodeRefactoring {
  repeated CodeEdit edits = 1;
  string description = 2;
  repeated string affected_files = 3;
}

message CodeDiagnostic {
  repeated Diagnostic items = 1;
}

message Diagnostic {
  string severity = 1; // error, warning, info, hint
  string message = 2;
  string file_path = 3;
  int32 line = 4;
  int32 column = 5;
  string source = 6;
  string code = 7;
}
`;

export class CodeProtocol {
  private root: protobuf.Root;
  private types: Map<string, protobuf.Type> = new Map();

  constructor() {
    this.root = protobuf.parse(protoDefinition).root;
    this.initializeTypes();
  }

  private initializeTypes(): void {
    const typeNames = [
      'CodeEdit', 'CodeContext', 'CodeCommand', 'CodeResponse',
      'CodeCompletion', 'CompletionItem', 'CodeExplanation',
      'ExplanationSection', 'CodeReference', 'CodeRefactoring',
      'CodeDiagnostic', 'Diagnostic'
    ];

    for (const typeName of typeNames) {
      const type = this.root.lookupType(typeName);
      this.types.set(typeName, type);
    }
  }

  encode(typeName: string, data: any): Uint8Array {
    const type = this.types.get(typeName);
    if (!type) throw new Error(`Unknown type: ${typeName}`);

    const message = type.create(data);
    return type.encode(message).finish();
  }

  decode(typeName: string, buffer: Uint8Array): any {
    const type = this.types.get(typeName);
    if (!type) throw new Error(`Unknown type: ${typeName}`);

    return type.decode(buffer);
  }

  createEdit(params: {
    filePath: string;
    lineStart: number;
    lineEnd: number;
    content: string;
    operation: 'insert' | 'delete' | 'replace';
    sessionId: string;
  }): Uint8Array {
    return this.encode('CodeEdit', {
      filePath: params.filePath,
      lineStart: params.lineStart,
      lineEnd: params.lineEnd,
      content: params.content,
      operation: params.operation,
      timestamp: Date.now(),
      sessionId: params.sessionId
    });
  }

  createCommand(params: {
    type: 'complete' | 'explain' | 'refactor' | 'debug';
    context: any;
    prompt: string;
    options?: Record<string, string>;
  }): Uint8Array {
    return this.encode('CodeCommand', {
      type: params.type,
      context: params.context,
      prompt: params.prompt,
      options: params.options || {}
    });
  }

  createCompletion(items: Array<{
    text: string;
    label: string;
    detail?: string;
    score?: number;
    kind?: string;
  }>): any {
    return {
      completion: {
        items: items.map(item => ({
          text: item.text,
          label: item.label,
          detail: item.detail || '',
          score: item.score || 1.0,
          kind: item.kind || 'unknown'
        }))
      }
    };
  }

  createDiagnostic(diagnostics: Array<{
    severity: 'error' | 'warning' | 'info' | 'hint';
    message: string;
    filePath: string;
    line: number;
    column: number;
    source?: string;
    code?: string;
  }>): any {
    return {
      diagnostic: {
        items: diagnostics.map(d => ({
          severity: d.severity,
          message: d.message,
          filePath: d.filePath,
          line: d.line,
          column: d.column,
          source: d.source || '',
          code: d.code || ''
        }))
      }
    };
  }

  static calculateSize(buffer: Uint8Array): number {
    return buffer.byteLength;
  }

  static compress(buffer: Uint8Array): Uint8Array {
    return buffer;
  }

  static decompress(buffer: Uint8Array): Uint8Array {
    return buffer;
  }
}