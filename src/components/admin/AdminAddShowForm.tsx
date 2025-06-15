
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Calendar as CalendarIcon, UploadIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { convertToCSV, parseCSV } from "@/utils/csvUtils";

const CSV_HEADERS = ["show_title", "episode_code", "episode_title", "air_date"];

const AdminAddShowForm: React.FC = () => {
  const { isAdmin } = useUserRoles();
  const { toast } = useToast();

  const [showTitle, setShowTitle] = useState("");
  const [episodeCode, setEpisodeCode] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [airDate, setAirDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  // Only render if admin
  if (!isAdmin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Minimal validation
      if (!showTitle || !episodeCode || !episodeTitle || !airDate) {
        toast({
          title: "All fields are required.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Insert show if it doesn't exist (by title)
      let { data: show, error: showError } = await supabase
        .from("shows")
        .select("id")
        .eq("title", showTitle)
        .maybeSingle();

      let showId = show?.id;
      if (!showId) {
        const { data: inserted, error: insertError } = await supabase
          .from("shows")
          .insert({ title: showTitle })
          .select("id")
          .single();
        if (insertError) throw insertError;
        showId = inserted.id;
      }

      // Parse episode code and airDate
      // Accept S01E01, S1E1, or 1x1 (convert to numbers)
      let snum = 1, epnum = 1;
      const match = episodeCode.match(
        /S?(\d{1,2})[Ex](\d{1,2})|(\d{1,2})x(\d{1,2})/
      );
      if (match) {
        snum = parseInt(match[1] || match[3] || "1", 10);
        epnum = parseInt(match[2] || match[4] || "1", 10);
      }
      // airDate is already a string like "YYYY-MM-DD"

      // Insert episode (air_date should be a string or null)
      const { error: episodeError } = await supabase
        .from("episodes")
        .insert({
          show_id: showId,
          title: episodeTitle,
          season_number: snum,
          episode_number: epnum,
          air_date: airDate || null,
        });

      if (episodeError) throw episodeError;

      toast({
        title: "Episode added successfully.",
        variant: "default",
      });

      // Reset fields
      setShowTitle("");
      setEpisodeCode("");
      setEpisodeTitle("");
      setAirDate("");
    } catch (err: any) {
      toast({
        title: "Error adding show or episode.",
        description: err?.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // CSV UPLOAD HANDLER
  const handleCsvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvLoading(true);

    const text = await file.text();
    let rows: any[] = [];
    try {
      rows = parseCSV(text);
    } catch (parseErr) {
      toast({
        title: "Failed to parse CSV.",
        description: "Check your file format.",
        variant: "destructive",
      });
      setCsvLoading(false);
      return;
    }

    // Verify headers
    const isValid = Object.keys(rows[0] || {}).every((h) => CSV_HEADERS.includes(h));
    if (!isValid) {
      toast({
        title: "Invalid CSV headers.",
        description: `Expected headers: ${CSV_HEADERS.join(", ")}`,
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
      const {
        show_title,
        episode_code,
        episode_title,
        air_date,
      } = row;

      if (!show_title || !episode_code || !episode_title || !air_date) {
        failed++;
        failedRows.push(i + 2);
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
        title: `Upload Finished: ${success} added.`,
        description: `${failed} failed.` + (failed > 0 ? ` Rows: ${failedRows.join(", ")}` : ""),
        variant: failed > 0 ? "default" : "success",
      });
    } else {
      toast({
        title: "Upload Failed.",
        description: "No rows added.",
        variant: "destructive",
      });
    }

    setCsvLoading(false);
  };

  return (
    <Card className="max-w-2xl mx-auto my-6 border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadIcon className="h-5 w-5" />
          Add Show & Episode (Admin)
        </CardTitle>
        <div className="text-muted-foreground text-sm">
          Enter show and episode details manually, or upload a CSV for bulk entry. All fields required.
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Show Title</label>
            <Input
              type="text"
              placeholder="e.g. Agent Carter"
              value={showTitle}
              onChange={e => setShowTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Episode Code</label>
            <Input
              type="text"
              placeholder="e.g. S01E01 or 1x01"
              value={episodeCode}
              onChange={e => setEpisodeCode(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Episode Title</label>
            <Input
              type="text"
              placeholder="e.g. Now is Not the End"
              value={episodeTitle}
              onChange={e => setEpisodeTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-1">
              Air Date <CalendarIcon className="h-4 w-4" />
            </label>
            <Input
              type="date"
              value={airDate}
              onChange={e => setAirDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={submitting}>
            {submitting ? "Adding..." : "Add Show & Episode"}
          </Button>
        </form>
        {/* CSV Upload */}
        <div className="my-8 border-t border-dashed pt-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">Bulk Upload with CSV</span>
            <a
              href={`data:text/csv,${encodeURIComponent(convertToCSV(
                [
                  {
                    show_title: "Example Show",
                    episode_code: "S01E01",
                    episode_title: "Example Episode",
                    air_date: "2024-01-01"
                  }
                ],
                CSV_HEADERS
              ))}`}
              download="shows_template.csv"
              className="text-blue-600 underline text-xs font-mono"
            >
              Download Example CSV
            </a>
          </div>
          <Input
            type="file"
            accept=".csv,text/csv"
            disabled={csvLoading}
            onChange={handleCsvChange}
          />
          <div className="text-xs text-muted-foreground mt-2">
            Headers required: <strong>{CSV_HEADERS.join(", ")}</strong>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>show_title: Show name</li>
              <li>episode_code: e.g. S01E01 or 1x01</li>
              <li>episode_title: Episode title</li>
              <li>air_date: YYYY-MM-DD</li>
            </ul>
          </div>
        </div>
        {/* Format requirements info */}
        <div className="mt-6 bg-muted/50 rounded p-3 text-xs leading-normal text-muted-foreground">
          <div className="font-semibold mb-1">Format requirements:</div>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>All fields required</li>
            <li>Episode format: S01E01, S1E1, or 1x1</li>
            <li>Air Date: Any valid date</li>
          </ul>
          <div>
            Or upload a CSV with headers: <code>{CSV_HEADERS.join(", ")}</code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAddShowForm;
