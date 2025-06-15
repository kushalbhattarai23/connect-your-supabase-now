
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import { UploadIcon, Import } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { parseCSV } from "@/utils/csvUtils";

const CSV_HEADERS = ["Show", "Episode", "Title", "Air Date"];

const AdminAddShowForm: React.FC = () => {
  const { isAdmin } = useUserRoles();
  const { toast } = useToast();

  const [csvText, setCsvText] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);

  // Only render if admin
  if (!isAdmin) return null;

  // Handle input file change (reads CSV as text and puts in CSV text area)
  const handleCsvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
  };

  // Main import handler (handles both pasted and uploaded CSV)
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setCsvLoading(true);

    let rows: any[] = [];
    try {
      rows = parseCSV(csvText);
    } catch (parseErr) {
      toast({
        title: "Failed to parse CSV.",
        description: "Check your file format.",
        variant: "destructive",
      });
      setCsvLoading(false);
      return;
    }

    // Validate headers
    const actualHeaders = Object.keys(rows[0] || {});
    const headersValid = CSV_HEADERS.every((header, idx) => (
      actualHeaders[idx]?.trim() === header
    ));
    if (!headersValid) {
      toast({
        title: "Invalid CSV headers.",
        description: `Headers must be exactly: ${CSV_HEADERS.join(", ")}`,
        variant: "destructive",
      });
      setCsvLoading(false);
      return;
    }

    let total = rows.length;
    let success = 0, failed = 0;
    let failedRows: number[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      // Read and trim fields
      const show_title = row["Show"]?.trim();
      const episode_code = row["Episode"]?.trim();
      const episode_title = row["Title"]?.trim();
      const air_date = row["Air Date"]?.trim();

      if (!show_title || !episode_code || !episode_title || !air_date) {
        failed++;
        failedRows.push(i + 2); // +2 since CSV usually has header (row 1-based)
        continue;
      }

      try {
        // Check/add show
        let { data: show, error: showError } = await supabase
          .from("shows")
          .select("id")
          .eq("title", show_title)
          .maybeSingle();

        let showId = show?.id;
        if (!showId) {
          const { data: inserted, error: insertErr } = await supabase
            .from("shows")
            .insert({ title: show_title })
            .select("id")
            .single();
          if (insertErr) throw insertErr;
          showId = inserted.id;
        }

        // Parse episode code: S01E01 / S1E1 / 1x1
        let snum = 1, epnum = 1;
        const match = episode_code.match(
          /S?(\d{1,2})[Ex](\d{1,2})|(\d{1,2})x(\d{1,2})/
        );
        if (match) {
          snum = parseInt(match[1] || match[3] || "1", 10);
          epnum = parseInt(match[2] || match[4] || "1", 10);
        }

        const { error: episodeErr } = await supabase
          .from("episodes")
          .insert({
            show_id: showId,
            title: episode_title,
            season_number: snum,
            episode_number: epnum,
            air_date: air_date || null,
          });

        if (episodeErr) throw episodeErr;

        success++;
      } catch (err) {
        failed++;
        failedRows.push(i + 2);
      }
    }

    if (success > 0) {
      toast({
        title: `Import Finished: ${success} added.`,
        description: `${failed} failed.` + (failed > 0 ? ` Rows: ${failedRows.join(", ")}` : ""),
        variant: "default",
      });
    } else {
      toast({
        title: "Import Failed.",
        description: "No rows added.",
        variant: "destructive",
      });
    }

    setCsvLoading(false);
    // Reset text area only if all processed
    if (success > 0) setCsvText("");
  };

  return (
    <Card className="max-w-3xl mx-auto my-6 border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Import className="h-5 w-5" /> CSV Import
        </CardTitle>
        <div className="text-muted-foreground text-sm">
          Import shows and episodes from a CSV file with columns: <strong>Show, Episode, Title, Air Date</strong>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleImport} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Upload CSV File</label>
            <Input
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvFileChange}
              disabled={csvLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Or Paste CSV Data</label>
            <Textarea
              rows={10}
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder={`Show,Episode,Title,Air Date
Agent Carter,S01E01,Now is Not the End,"January 6, 2015"
Agent Carter,S01E02,Bridge and Tunnel,"January 13, 2015"
`}
              className="font-mono"
              disabled={csvLoading}
            />
          </div>

          <div>
            <div className="font-semibold mb-1">Format requirements:</div>
            <ul className="list-disc pl-5 space-y-1 text-sm mb-2">
              <li>Comma-separated values (CSV) or Tab-separated values (TSV)</li>
              <li>First row must be headers: <code>Show, Episode, Title, Air Date</code></li>
              <li>Episode format: <code>S01E01</code>, <code>S1E1</code>, or <code>1x1</code></li>
              <li>Air Date: Any standard date format (e.g., <code>January 6, 2015</code>)</li>
              <li>Fields with commas should be quoted</li>
            </ul>
          </div>

          <Button
            className="w-full bg-gray-400 text-white hover:bg-gray-500"
            type="submit"
            disabled={csvLoading || !csvText.trim()}
          >
            <UploadIcon className="mr-1" /> {csvLoading ? "Importing..." : "Import Data"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminAddShowForm;
