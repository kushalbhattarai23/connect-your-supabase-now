
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
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

const CSV_HEADERS = ["Show", "Episode", "Title", "Air Date"];

const AdminAddShowForm: React.FC = () => {
  const { isAdmin } = useUserRoles();
  const { toast } = useToast();

  const [csvText, setCsvText] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);
  const [importedEpisodes, setImportedEpisodes] = useState<any[]>([]);
  const [importErrorRows, setImportErrorRows] = useState<{ row: number, error: string }[]>([]);

  // Only render if admin
  if (!isAdmin) return null;

  const handleCsvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setCsvLoading(true);
    setImportedEpisodes([]);
    setImportErrorRows([]);

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

    let uploadedEpisodes: any[] = [];
    let errorRows: { row: number, error: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const show_title = row["Show"]?.trim();
      const episode_code = row["Episode"]?.trim();
      const episode_title = row["Title"]?.trim();
      const air_date = row["Air Date"]?.trim();

      // skip if any required field is missing
      if (!show_title || !episode_code || !episode_title || !air_date) {
        errorRows.push({ row: i + 2, error: "Missing required field(s)" });
        continue;
      }

      let showId: string | null = null;
      try {
        // Get or insert show
        let { data: show, error: showError } = await supabase
          .from("shows")
          .select("id")
          .eq("title", show_title)
          .maybeSingle();

        if (showError) throw showError;
        showId = show?.id;
        if (!showId) {
          // Insert show
          const { data: inserted, error: insertErr } = await supabase
            .from("shows")
            .insert({ title: show_title })
            .select("id")
            .single();
          if (insertErr) throw insertErr;
          showId = inserted.id;
        }

        // Parse episode code (e.g., S01E01, S1E1, 1x1)
        let snum = 1, epnum = 1;
        const codeMatch = episode_code.match(/^S?(\d{1,2})[Ex](\d{1,2})$/i) 
          || episode_code.match(/^(\d{1,2})x(\d{1,2})$/i);
        if (codeMatch) {
          snum = parseInt(codeMatch[1], 10);
          epnum = parseInt(codeMatch[2], 10);
        } else {
          errorRows.push({ row: i + 2, error: "Invalid episode format" });
          continue;
        }

        // Insert the episode
        const { data: episode, error: episodeErr } = await supabase
          .from("episodes")
          .insert({
            show_id: showId,
            title: episode_title,
            season_number: snum,
            episode_number: epnum,
            air_date: air_date || null,
          })
          .select("*")
          .single();

        if (episodeErr) throw episodeErr;

        uploadedEpisodes.push({
          ...episode,
          show_title,
          season_number: snum,
          episode_number: epnum
        });
      } catch (err: any) {
        errorRows.push({ row: i + 2, error: "DB error or duplicate entry" });
      }
    }

    // Show toast based on result
    if (uploadedEpisodes.length > 0) {
      toast({
        title: `Import finished. ${uploadedEpisodes.length} episode(s) uploaded.`,
        description: errorRows.length > 0
          ? `Some rows failed: ${errorRows.map(er => "Row " + er.row).join(", ")}`
          : undefined,
        variant: errorRows.length > 0 ? "destructive" : "default",
      });
      setImportedEpisodes(uploadedEpisodes);
    } else {
      toast({
        title: "No episodes uploaded.",
        description: errorRows.length > 0 ? errorRows.map(er => `Row ${er.row}: ${er.error}`).join(" / ") : "",
        variant: "destructive"
      });
      setImportedEpisodes([]);
    }

    setImportErrorRows(errorRows);
    setCsvLoading(false);
    if (uploadedEpisodes.length > 0) setCsvText("");
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
            className="w-full bg-gray-400 text-white hover:bg-gray-500 disabled:opacity-50"
            type="submit"
            disabled={csvLoading || !csvText.trim()}
          >
            {csvLoading ? <Loader2 className="animate-spin mr-1" /> : <UploadIcon className="mr-1" />}
            {csvLoading ? "Importing..." : "Import Data"}
          </Button>
        </form>
        {importedEpisodes.length > 0 && (
          <div className="mt-8">
            <div className="font-semibold mb-2 text-lg">Imported Episodes</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Show</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead>Episode</TableHead>
                  <TableHead>Air Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importedEpisodes.map((ep, idx) => (
                  <TableRow key={ep.id || idx}>
                    <TableCell>{ep.show_title}</TableCell>
                    <TableCell>{ep.title}</TableCell>
                    <TableCell>{ep.season_number}</TableCell>
                    <TableCell>{ep.episode_number}</TableCell>
                    <TableCell>{ep.air_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {(importErrorRows.length > 0 && importedEpisodes.length > 0) && (
          <div className="mt-4 text-sm text-red-500">
            <b>Some rows failed:</b> {importErrorRows.map(er => `Row ${er.row}: ${er.error}`).join("; ")}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAddShowForm;
