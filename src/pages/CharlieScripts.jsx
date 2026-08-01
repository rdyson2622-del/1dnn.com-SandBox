import React from "react";
import { appClient } from "@/api/appClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function CharlieScripts() {
  const { data: scripts, isLoading } = useQuery({
    queryKey: ['charlie-scripts'],
    queryFn: () => appClient.entities.CharlieScript.list(),
    initialData: [],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Charlie Scripts</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Script
          </Button>
        </div>

        <div className="grid gap-6">
          {scripts.map((script) => (
            <Card key={script.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {script.page_name} ({script.page_code})
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Page #{script.page_number} • {script.script_type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Context:</p>
                    <p className="text-sm text-muted-foreground">{script.context}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Script:</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {script.script_text}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded ${script.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {script.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {script.last_edited_by && (
                      <p className="text-xs text-muted-foreground">
                        Last edited by: {script.last_edited_by}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}