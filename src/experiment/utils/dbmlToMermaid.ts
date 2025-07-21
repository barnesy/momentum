import { Parser } from '@dbml/core';

export function dbmlToMermaid(dbmlContent: string): string {
  try {
    // Parse DBML
    const parsed = Parser.parse(dbmlContent, 'dbml');
    const schema = parsed.schemas[0];
    
    if (!schema) {
      throw new Error('No schema found in DBML');
    }

    // Start building Mermaid ER diagram
    let mermaid = 'erDiagram\n';
    
    // Add tables
    schema.tables.forEach((table: any) => {
      mermaid += `  ${table.name} {\n`;
      
      // Add fields
      table.fields.forEach((field: any) => {
        const fieldType = field.type.type_name.toUpperCase();
        const constraints = [];
        
        if (field.pk) constraints.push('PK');
        if (field.unique) constraints.push('UK');
        if (field.not_null) constraints.push('NOT NULL');
        
        const constraintStr = constraints.length > 0 ? ` "${constraints.join(', ')}"` : '';
        mermaid += `    ${fieldType} ${field.name}${constraintStr}\n`;
      });
      
      mermaid += '  }\n';
    });
    
    // Add relationships
    schema.refs.forEach((ref: any) => {
      const fromTable = ref.endpoints[0].tableName;
      const fromField = ref.endpoints[0].fieldNames[0];
      const toTable = ref.endpoints[1].tableName;
      const toField = ref.endpoints[1].fieldNames[0];
      
      // Determine relationship type based on cardinality
      let relationSymbol = '||--||'; // one-to-one by default
      
      // If it's a foreign key relationship, it's typically many-to-one
      if (ref.endpoints[0].relation === '*') {
        relationSymbol = '}o--||'; // many-to-one
      } else if (ref.endpoints[1].relation === '*') {
        relationSymbol = '||--o{'; // one-to-many
      } else if (ref.endpoints[0].relation === '-') {
        relationSymbol = '||--||'; // one-to-one
      }
      
      mermaid += `  ${fromTable} ${relationSymbol} ${toTable} : "${fromField} to ${toField}"\n`;
    });
    
    return mermaid;
  } catch (error: any) {
    throw new Error(`Failed to convert DBML to Mermaid: ${error.message}`);
  }
}

// Helper function to escape special characters for Mermaid
function escapeMermaid(str: string): string {
  return str.replace(/[\"]/g, '');
}