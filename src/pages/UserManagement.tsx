import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Shield, User, Loader2, ArrowLeft, CheckCircle, XCircle, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  roles: string[];
}

const UserManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (error || !roles) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate("/admin");
        return;
      }

      setIsAdmin(true);
      fetchUsers();
    } catch (error) {
      console.error('Auth check error:', error);
      navigate("/auth");
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data - Note: email requires auth.admin which isn't available in client SDK
      // For now, we'll display user IDs. In production, consider adding email to profiles table
      const userProfiles: UserProfile[] = (profiles || []).map(profile => {
        const roles = userRoles?.filter(r => r.user_id === profile.id).map(r => r.role) || [];
        
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.id.slice(0, 8) + '...', // Display partial ID instead
          roles,
        };
      });

      setUsers(userProfiles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAdminByEmail = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsAddingAdmin(true);
    try {
      // First, find the user by email using our custom function
      const { data: userId, error: userError } = await supabase
        .rpc('get_user_id_by_email', {
          email_param: newAdminEmail.trim()
        });

      if (userError || !userId) {
        toast({
          title: "User Not Found",
          description: "No user found with that email address. They must sign up first.",
          variant: "destructive",
        });
        setIsAddingAdmin(false);
        return;
      }

      // Add admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role: 'admin' as const,
        }]);

      if (roleError) {
        if (roleError.code === '23505') {
          toast({
            title: "Already Admin",
            description: "This user already has admin privileges.",
          });
        } else {
          throw roleError;
        }
      } else {
        toast({
          title: "Admin Added",
          description: `${newAdminEmail} has been granted admin access.`,
        });
      }

      setNewAdminEmail("");
      setIsDialogOpen(false);
      await fetchUsers();
    } catch (error) {
      console.error('Error adding admin:', error);
      toast({
        title: "Error",
        description: "Failed to add admin. Make sure the user exists.",
        variant: "destructive",
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const toggleAdminRole = async (userId: string, currentRoles: string[]) => {
    setProcessingUserId(userId);
    try {
      const hasAdmin = currentRoles.includes('admin');

      if (hasAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;

        toast({
          title: "Admin Access Removed",
          description: "User has been demoted from admin role.",
        });
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'admin',
          });

        if (error) throw error;

        toast({
          title: "Admin Access Granted",
          description: "User has been promoted to admin role.",
        });
      }

      await fetchUsers();
    } catch (error) {
      console.error('Error toggling admin role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Portal
          </Button>
          <h1 className="mb-2 text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Users
                </CardTitle>
                <CardDescription>
                  Total users: {users.length}
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Admin User</DialogTitle>
                    <DialogDescription>
                      Enter the email address of an existing user to grant them admin privileges.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email Address</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="user@example.com"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isAddingAdmin) {
                            addAdminByEmail();
                          }
                        }}
                      />
                    </div>
                    <Button
                      onClick={addAdminByEmail}
                      disabled={isAddingAdmin || !newAdminEmail.trim()}
                      className="w-full"
                    >
                      {isAddingAdmin ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding Admin...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Grant Admin Access
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No users found.
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => {
                  const isAdmin = user.roles.includes('admin');
                  const isProcessing = processingUserId === user.id;

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          {isAdmin ? (
                            <Shield className="h-6 w-6 text-primary" />
                          ) : (
                            <User className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.full_name || 'Unnamed User'}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="mt-1 flex gap-2">
                            {user.roles.map((role) => (
                              <Badge
                                key={role}
                                variant={role === 'admin' ? 'default' : 'secondary'}
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => toggleAdminRole(user.id, user.roles)}
                        disabled={isProcessing}
                        variant={isAdmin ? "destructive" : "default"}
                        className="gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : isAdmin ? (
                          <>
                            <XCircle className="h-4 w-4" />
                            Remove Admin
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Make Admin
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
