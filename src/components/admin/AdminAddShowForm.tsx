
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Calendar as CalendarIcon, UploadIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminAddShowForm: React.FC = () => {
  const { isAdmin } = useUserRoles();
  const { toast } = useToast();

  const [showTitle, setShowTitle] = useState("");
  const [episodeCode, setEpisodeCode] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [airDate, setAirDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      const parsedAirDate = new Date(airDate);

      // Insert episode
      const { error: episodeError } = await supabase
        .from("episodes")
        .insert({
          show_id: showId,
          title: episodeTitle,
          season_number: snum,
          episode_number: epnum,
          air_date: isNaN(parsedAirDate.getTime()) ? null : parsedAirDate,
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

  return (
    <Card className="max-w-2xl mx-auto my-6 border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadIcon className="h-5 w-5" />
          Add Show & Episode (Admin)
        </CardTitle>
        <div className="text-muted-foreground text-sm">
          Enter show and episode details manually. All fields required.
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
        {/* Format requirements info */}
        <div className="mt-6 bg-muted/50 rounded p-3 text-xs leading-normal text-muted-foreground">
          <div className="font-semibold mb-1">Format requirements:</div>
          <ul className="list-disc pl-5 space-y-1 mb-2">
            <li>All fields required</li>
            <li>Episode format: S01E01, S1E1, or 1x1</li>
            <li>Air Date: Any valid date</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAddShowForm;
