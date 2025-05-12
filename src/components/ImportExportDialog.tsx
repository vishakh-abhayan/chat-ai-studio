
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { Import, Download, Upload } from "lucide-react";
import { toast } from "sonner";

interface ImportExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => string;
  onImport: (data: string) => boolean;
}

export const ImportExportDialog = ({ 
  isOpen, 
  onClose, 
  onExport, 
  onImport 
}: ImportExportDialogProps) => {
  const [mode, setMode] = useState<'export' | 'import'>('export');
  const [importData, setImportData] = useState('');
  const [exportData, setExportData] = useState('');

  const handleExport = () => {
    try {
      const data = onExport();
      setExportData(data);
      setMode('export');
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const handleImport = () => {
    try {
      const success = onImport(importData);
      if (success) {
        toast.success("Data imported successfully");
        onClose();
      } else {
        toast.error("Failed to import data");
      }
    } catch (error) {
      toast.error("Error importing data: Invalid format");
    }
  };

  const downloadExport = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `azure-openai-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import / Export Data</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Button
            variant={mode === 'export' ? 'default' : 'outline'}
            onClick={() => {
              setMode('export');
              handleExport();
            }}
            className="flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Export
          </Button>
          <Button
            variant={mode === 'import' ? 'default' : 'outline'}
            onClick={() => setMode('import')}
            className="flex items-center justify-center gap-2"
          >
            <Upload size={18} />
            Import
          </Button>
        </div>
        
        {mode === 'export' ? (
          <div className="space-y-4">
            <Textarea
              value={exportData}
              className="h-60 font-mono"
              readOnly
            />
            <Button onClick={downloadExport} className="flex items-center gap-2">
              <Download size={16} />
              Download JSON
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste JSON data here..."
              className="h-60 font-mono"
            />
            <Button onClick={handleImport} className="flex items-center gap-2">
              <Import size={16} />
              Import Data
            </Button>
            <p className="text-xs text-gray-500">
              Warning: Importing data will overwrite your existing configuration and conversations.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
