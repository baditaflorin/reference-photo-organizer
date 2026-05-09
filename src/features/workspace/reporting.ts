import type { ImportIssue, ImportIssueCode, ImportIssueSeverity, ImportReport, ImportSource } from './types';

interface CreateImportIssueInput {
  code: ImportIssueCode;
  severity: ImportIssueSeverity;
  source: ImportSource;
  name: string;
  path?: string;
  message: string;
  nextStep: string;
}

export function createImportReport(source: ImportSource, attempted: number): ImportReport {
  const startedAt = new Date().toISOString();
  return {
    source,
    startedAt,
    completedAt: startedAt,
    attempted,
    imported: 0,
    duplicates: 0,
    skipped: 0,
    failed: 0,
    issues: []
  };
}

export function finishImportReport(report: ImportReport): ImportReport {
  return {
    ...report,
    completedAt: new Date().toISOString()
  };
}

export function appendIssue(report: ImportReport, issue: ImportIssue): ImportReport {
  return {
    ...report,
    issues: [...report.issues, issue]
  };
}

export function createImportIssue(input: CreateImportIssueInput): ImportIssue {
  return {
    id: createImportIssueId(input),
    code: input.code,
    severity: input.severity,
    source: input.source,
    name: input.name,
    path: input.path ?? input.name,
    message: input.message,
    nextStep: input.nextStep
  };
}

export function importReportSummary(report: ImportReport) {
  return `${report.imported} imported, ${report.duplicates} duplicates, ${report.skipped} skipped, ${report.failed} failed`;
}

function createImportIssueId(input: CreateImportIssueInput) {
  return `${input.code}:${input.path ?? input.name}:${input.source}`;
}
