
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Users, Edit, Trash2, Globe, Lock } from 'lucide-react';
import { useUniverses } from '@/hooks/useUniverses';

export const TVShowPrivateUniverses: React.FC = () => {
  const { universes, isLoading, createUniverse, updateUniverse, deleteUniverse } = useUniverses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUniverse, setEditingUniverse] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUniverse) {
      updateUniverse.mutate({ id: editingUniverse.id, ...formData });
    } else {
      createUniverse.mutate(formData);
    }
    
    setIsDialogOpen(false);
    setEditingUniverse(null);
    setFormData({ name: '', description: '', is_public: false });
  };

  const handleEdit = (universe: any) => {
    setEditingUniverse(universe);
    setFormData({
      name: universe.name,
      description: universe.description || '',
      is_public: universe.is_public
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this universe?')) {
      deleteUniverse.mutate(id);
    }
  };

  const privateUniverses = universes.filter(u => !u.is_public);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-700">Private Universes</h1>
          <p className="text-muted-foreground">Manage your personal show universes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Universe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUniverse ? 'Edit Universe' : 'Create New Universe'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Universe Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Marvel Cinematic Universe"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your universe..."
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                />
                <Label htmlFor="is_public">Make this universe public</Label>
              </div>
              
              <div className="flex gap-4">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  {editingUniverse ? 'Update' : 'Create'} Universe
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading universes...</div>
      ) : privateUniverses.length === 0 ? (
        <Card className="border-purple-200">
          <CardContent className="text-center py-8">
            <Lock className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Private Universes Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first private universe to organize your shows</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {privateUniverses.map((universe) => (
            <Card key={universe.id} className="border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-purple-700">{universe.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(universe)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(universe.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{universe.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Created: {new Date(universe.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Lock className="h-3 w-3 text-purple-500" />
                    <span className="text-xs text-purple-600">Private</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TVShowPrivateUniverses;
