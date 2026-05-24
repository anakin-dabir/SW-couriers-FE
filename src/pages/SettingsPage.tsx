// import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/atoms';
// import { Button } from '@/components/atoms/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/molecules/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/molecules/card';
import { cn } from '@/lib/utils';

export default function SettingsPage(): React.JSX.Element {
  // const navigate = useNavigate();

  return (
    <div className={cn('flex flex-col gap-6')}>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
        // actions={
        //   <Button variant="default" size="sm" onClick={() => void navigate('/deliveries/pending')}>
        //     New Pickup Request
        //   </Button>
        // }
      />

      <Tabs defaultValue="company-details" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="company-details">Company Details</TabsTrigger>
          <TabsTrigger value="user-contacts">User &amp; Contacts</TabsTrigger>
          <TabsTrigger value="accounts-details">Payment Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="company-details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>
                Manage your company name, registration and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent>Content for company details will go here.</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="user-contacts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User &amp; Contacts</CardTitle>
              <CardDescription>Manage your users and contact information.</CardDescription>
            </CardHeader>
            <CardContent>Content for user &amp; contacts will go here.</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="accounts-details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Manage account settings, users and permissions.</CardDescription>
            </CardHeader>
            <CardContent>Content for accounts details will go here.</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
