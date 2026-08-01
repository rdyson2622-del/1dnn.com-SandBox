import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import PageNotFound from './lib/PageNotFound';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import PageNumberBadge from './components/PageNumberBadge';

// Layout Imports
import AdminLayout from './components/layout/AdminLayout';
import AppLayout from './components/layout/AppLayout';

// Page Imports
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RelocationIntake from './pages/RelocationIntake';
import RelocationRoadmap from './components/intake/RelocationRoadmap';
import FindAgent from './pages/FindAgent';
import GeminiSession from './pages/GeminiSession';
import Admin from './pages/Admin';
import CharlieScripts from './pages/CharlieScripts';
import AdminClients from './pages/AdminClients';
import AdminClientDetail from './pages/AdminClientDetail';
import AdminCommunications from './pages/AdminCommunications';
import AdminSearchProfiles from './pages/AdminSearchProfiles';
import AdminOwners from './pages/AdminOwners';
import AdminOutreachCampaigns from './pages/AdminOutreachCampaigns';
import AdminPresentationLibrary from './pages/AdminPresentationLibrary';
import AdminFlaggedConversations from './pages/AdminFlaggedConversations';
import AdminReferrals from './pages/AdminReferrals';
import AdminCharlieScripts from './pages/AdminCharlieScripts';
import AdminCharlieKnowledgeBase from './pages/AdminCharlieKnowledgeBase.jsx';
import AdminCharlieEscalations from './pages/AdminCharlieEscalations.jsx';
import AdminBobLibrary from './pages/AdminBobLibrary';
import BusinessPlan from './pages/BusinessPlan';
import Explainers from './pages/Explainers';
import Chat from './pages/Chat';
import ClientCommunicationsExplainer from './pages/ClientCommunicationsExplainer';
import Search from './pages/Search';
import CityGuide from './pages/CityGuide';
import PropertyComparison from './pages/PropertyComparison';
import AdminSkipTrace from './pages/AdminSkipTrace';
import AdminBulkSkipTrace from './pages/AdminBulkSkipTrace';
import AdminMarketingCampaigns from './pages/AdminMarketingCampaigns';
import AdminTargetAudiences from './pages/AdminTargetAudiences';
import AdminCampaignRoadmap from './pages/AdminCampaignRoadmap';
import AdminSocialLaunch from './pages/AdminSocialLaunch';
import AdminOutreachPipeline from './pages/AdminOutreachPipeline';
import AdminBatchSMSLog from './pages/AdminBatchSMSLog';
import AdminOutreachAnalytics from './pages/AdminOutreachAnalytics';
import AdminSMSSequences from './pages/AdminSMSSequences';
import AdminOwnerKanban from './pages/AdminOwnerKanban';
import AdminOptIns from './pages/AdminOptIns';
import AdminActiveCampaigns from './pages/AdminActiveCampaigns';
import AdminScheduledCampaigns from './pages/AdminScheduledCampaigns.jsx';
import AdminVideoSMSCampaign from './pages/AdminVideoSMSCampaign.jsx';
import AdminVideoLibrary from './pages/AdminVideoLibrary.jsx';
import AdminMediaCRM from './pages/AdminMediaCRM';
import AdminPitchTracker from './pages/AdminPitchTracker';
import AdminPressKit from './pages/AdminPressKit';
import AdminMassPitchPersonalizer from './pages/AdminMassPitchPersonalizer';
import MediaRoom from './pages/MediaRoom';
import AdminComposeSMS from './pages/AdminComposeSMS';
import DnnNewsFeed from './pages/DnnNewsFeed';
import DnnMarketData from './pages/DnnMarketData';
import DnnSubscriberCRM from './pages/DnnSubscriberCRM';
import DnnCommunicationsHub from './pages/DnnCommunicationsHub';
import DnnAgentBureau from './pages/DnnAgentBureau';
import BobDyson from './pages/BobDyson';
import AIAssistants from './pages/AIAssistants';
import ReadyToStart from './components/dashboard/ReadyToStart';
import CharlieVoicePresentation from './pages/CharlieVoicePresentation';
import ConsumerDnnNews from './pages/ConsumerDnnNews';
import MyAgent from './pages/MyAgent';
import FinancialServices from './pages/FinancialServices';
import AdminNewLandingPage from './pages/AdminNewLandingPage';
import AdminReloManagement from './pages/AdminReloManagement';
import AdminDnnRevenue from './pages/AdminDnnRevenue';
import AdminAgentVetting from './pages/AdminAgentVetting';
import AdminLenderVetting from './pages/AdminLenderVetting';
import AdminBureauStories from './pages/AdminBureauStories';
import ReloManagement from './pages/ReloManagement';
import ReloManagementVideoBg from './pages/ReloManagementVideoBg';
import SolveMyStory from './pages/SolveMyStory';
import AdminPRNAgentPlan from './pages/AdminPRNAgentPlan';
import RoleSelector from './pages/RoleSelector';
import BroadcastPreview from './pages/BroadcastPreview';
import BroadcastShow from './pages/BroadcastShow';
import AgentInvitedClients from './pages/AgentInvitedClients';
import RealEstateAnswers from './pages/RealEstateAnswers';
import NationalVettedDirectory from './pages/NationalVettedDirectory';
import AdminRoster from './pages/AdminRoster';
import AdminAffiliateRecruiting from './pages/AdminAffiliateRecruiting';
import VettedAgentsCity from './pages/VettedAgentsCity';
import SendingAgentDashboard from './pages/SendingAgentDashboard';
import AdminExodusPitch from './pages/AdminExodusPitch';
import AdminPartnerBenefits from './pages/AdminPartnerBenefits';
import AdminExodusOutreach from './pages/AdminExodusOutreach';
import AdminPRNAgreements from './pages/AdminPRNAgreements';
import AdminMasterAgreement from './pages/AdminMasterAgreement';
import AdminLeadHandoff from './pages/AdminLeadHandoff';
import DnnStudioDashboard from './pages/DnnStudioDashboard';
import AdminRecruitingBroadcast from './pages/AdminRecruitingBroadcast';
import DnnScriptReview from './pages/DnnScriptReview';
import DnnVideoPreview from './pages/DnnVideoPreview';
import AdminShowPipeline from './pages/AdminShowPipeline';
import AdminDailyNewsLibrary from './pages/AdminDailyNewsLibrary';
import HeygenCreditMonitor from './pages/HeygenCreditMonitor';
import AdminProductionDashboard from './pages/AdminProductionDashboard';
import AdminComplianceReview from './pages/AdminComplianceReview';
import Shard2Dashboard from './pages/Shard2Dashboard';
import Shard2Pages from './pages/Shard2Pages';
import Shard2Scripts from './pages/Shard2Scripts';
import Shard2Library from './pages/Shard2Library';
import Shard2Settings from './pages/Shard2Settings';
import SendingAgentLanding from './pages/SendingAgentLanding';
import CorporateRelo from './pages/CorporateRelo';
import AdminCorporateRelo from './pages/AdminCorporateRelo';
import AdminQAScriptStudio from './pages/AdminQAScriptStudio';
import AgentLanding from './pages/AgentLanding';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Subscribe from './pages/Subscribe';
import AgentSubscribe from './pages/AgentSubscribe';
import TermsOfService from './pages/TermsOfService';
import Login from './pages/Login';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Public routes — accessible without authentication (for LinkedIn/social media scraping & link previews)
  const path = window.location.pathname;
  if (path === '/broadcast-show' || path === '/broadcast-preview' || path === '/login') {
    return (
      <Routes>
        <Route path="/broadcast-show" element={<BroadcastShow />} />
        <Route path="/broadcast-preview" element={<BroadcastPreview />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Role Selector — standalone, no sidebar */}
      <Route path="/portal" element={<RoleSelector />} />
      <Route path="/broadcast-preview" element={<BroadcastPreview />} />
      <Route path="/broadcast-show" element={<BroadcastShow />} />
      <Route path="/login" element={<Login />} />

      {/* Front door — qualifying landing page, no portal chrome */}
      <Route path="/" element={<RoleSelector />} />
      <Route path="/home" element={<Home />} />
      <Route path="/Home" element={<Home />} />

      {/* Consumer Routes with Sidebar Layout */}
      {/* ⚠️ CRITICAL: These routes are essential for the app. Do not remove without careful review. */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/relocation-intake" element={<RelocationIntake />} />
        <Route path="/RelocationIntake" element={<RelocationIntake />} />
        <Route path="/relocation-roadmap" element={<RelocationRoadmap />} />
        <Route path="/RelocationRoadmap" element={<RelocationRoadmap />} />
        <Route path="/gemini" element={<GeminiSession />} />
        <Route path="/GeminiSession" element={<GeminiSession />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/Chat" element={<Chat />} />
        <Route path="/communications-explainer" element={<ClientCommunicationsExplainer />} />
        <Route path="/relocation-roadmap" element={<RelocationRoadmap />} />
        <Route path="/RelocationRoadmap" element={<RelocationRoadmap />} />
        <Route path="/gemini" element={<GeminiSession />} />
        <Route path="/GeminiSession" element={<GeminiSession />} />
        {/* PERMANENT FIX: /communications-explainer is CRITICAL — do not remove */}
        <Route path="/CityGuide" element={<CityGuide />} />
        <Route path="/city-guide" element={<CityGuide />} />
        <Route path="/search" element={<Search />} />
        <Route path="/FindAgent" element={<FindAgent />} />
        <Route path="/find-agent" element={<FindAgent />} />
        <Route path="/media" element={<MediaRoom />} />
        <Route path="/dnn-news" element={<ConsumerDnnNews />} />
        <Route path="/my-agent" element={<MyAgent />} />
        <Route path="/financial-services" element={<FinancialServices />} />
        <Route path="/relo-management" element={<ReloManagement />} />
        <Route path="/corporate-relo" element={<CorporateRelo />} />
        <Route path="/bob-dyson" element={<BobDyson />} />
        <Route path="/Explainers" element={<Explainers />} />
        <Route path="/explainers" element={<Explainers />} />
        <Route path="/ai-assistants" element={<AIAssistants />} />
        <Route path="/agent-invited-clients" element={<AgentInvitedClients />} />
        <Route path="/real-estate-answers" element={<RealEstateAnswers />} />
        <Route path="/national-directory" element={<NationalVettedDirectory />} />
        <Route path="/subscribe" element={<Subscribe />} />
      <Route path="/agent-subscribe" element={<AgentSubscribe />} />
      <Route path="/partner-benefits" element={<SendingAgentLanding />} />
      <Route path="/vetted-agents/:citySlug" element={<VettedAgentsCity />} />
      </Route>
      
      {/* Admin Routes with Sidebar Layout */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/scripts" element={<CharlieScripts />} />
        <Route path="/admin/clients" element={<AdminClients />} />
        <Route path="/admin/client-detail" element={<AdminClientDetail />} />
        <Route path="/admin/communications" element={<AdminCommunications />} />
        <Route path="/admin/search-profiles" element={<AdminSearchProfiles />} />
        <Route path="/admin/owners" element={<AdminOwners />} />
        <Route path="/admin/outreach-campaigns" element={<AdminOutreachCampaigns />} />
        <Route path="/admin/outreach-pipeline" element={<AdminOutreachPipeline />} />
        <Route path="/admin/batch-sms-log" element={<AdminBatchSMSLog />} />
        <Route path="/admin/outreach-analytics" element={<AdminOutreachAnalytics />} />
        <Route path="/admin/sms-sequences" element={<AdminSMSSequences />} />
        <Route path="/admin/owner-kanban" element={<AdminOwnerKanban />} />
        <Route path="/admin/compose-sms" element={<AdminComposeSMS />} />
        <Route path="/admin/dnn/news-feed" element={<DnnNewsFeed />} />
        <Route path="/admin/dnn/market-data" element={<DnnMarketData />} />
        <Route path="/admin/dnn/subscribers" element={<DnnSubscriberCRM />} />
        <Route path="/admin/dnn/communications" element={<DnnCommunicationsHub />} />
        <Route path="/admin/dnn/agent-bureau" element={<DnnAgentBureau />} />
        <Route path="/admin/active-campaigns" element={<AdminActiveCampaigns />} />
        <Route path="/admin/scheduled-campaigns" element={<AdminScheduledCampaigns />} />
        <Route path="/admin/video-sms-campaign" element={<AdminVideoSMSCampaign />} />
        <Route path="/admin/video-library" element={<AdminVideoLibrary />} />
        <Route path="/admin/media-crm" element={<AdminMediaCRM />} />
        <Route path="/admin/pitch-tracker" element={<AdminPitchTracker />} />
        <Route path="/admin/press-kit" element={<AdminPressKit />} />
        <Route path="/admin/mass-pitch" element={<AdminMassPitchPersonalizer />} />
        <Route path="/admin/opt-ins" element={<AdminOptIns />} />
        <Route path="/admin/presentation-library" element={<AdminPresentationLibrary />} />
        <Route path="/admin/communications" element={<AdminCommunications />} />
        <Route path="/admin/flagged-conversations" element={<AdminFlaggedConversations />} />
        <Route path="/admin/referrals" element={<AdminReferrals />} />
        <Route path="/admin/charlie-scripts" element={<AdminCharlieScripts />} />
        <Route path="/admin/charlie-knowledge-base" element={<AdminCharlieKnowledgeBase />} />
        <Route path="/admin/charlie-escalations" element={<AdminCharlieEscalations />} />
        <Route path="/admin/bob-library" element={<AdminBobLibrary />} />
        <Route path="/admin/skip-trace" element={<AdminSkipTrace />} />
        <Route path="/admin/bulk-skip-trace" element={<AdminBulkSkipTrace />} />
        <Route path="/admin/marketing-campaigns" element={<AdminMarketingCampaigns />} />
        <Route path="/admin/target-audiences" element={<AdminTargetAudiences />} />
        <Route path="/admin/campaign-roadmap" element={<AdminCampaignRoadmap />} />
        <Route path="/admin/social-launch" element={<AdminSocialLaunch />} />
        <Route path="/admin/business-plan" element={<BusinessPlan />} />
        <Route path="/business-plan" element={<Navigate to="/admin/business-plan" replace />} />
        <Route path="/admin/new-landing-page" element={<AdminNewLandingPage />} />
        <Route path="/admin/relo-management" element={<AdminReloManagement />} />
        <Route path="/admin/corporate-relo" element={<AdminCorporateRelo />} />
        <Route path="/admin/dnn/revenue" element={<AdminDnnRevenue />} />
        <Route path="/admin/dnn/agent-vetting" element={<AdminAgentVetting />} />
        <Route path="/admin/dnn/lender-vetting" element={<AdminLenderVetting />} />
        <Route path="/admin/dnn/bureau-stories" element={<AdminBureauStories />} />
        <Route path="/solve-my-story" element={<SolveMyStory />} />
        <Route path="/admin/prn-agent-plan" element={<AdminPRNAgentPlan />} />
        <Route path="/admin/roster" element={<AdminRoster />} />
        <Route path="/admin/affiliate-recruiting" element={<AdminAffiliateRecruiting />} />
        <Route path="/admin/sending-agents" element={<SendingAgentDashboard />} />
        <Route path="/admin/exodus-pitch" element={<AdminExodusPitch />} />
        <Route path="/admin/partner-benefits" element={<AdminPartnerBenefits />} />
        <Route path="/admin/exodus-outreach" element={<AdminExodusOutreach />} />
        <Route path="/admin/prn-agreements" element={<AdminPRNAgreements />} />
        <Route path="/admin/master-agreement" element={<AdminMasterAgreement />} />
        <Route path="/admin/lead-handoff" element={<AdminLeadHandoff />} />
        <Route path="/admin/dnn/studio" element={<DnnStudioDashboard />} />
        <Route path="/admin/dnn/recruiting" element={<AdminRecruitingBroadcast />} />
        <Route path="/admin/dnn/script-review" element={<DnnScriptReview />} />
        <Route path="/admin/dnn/video-preview" element={<DnnVideoPreview />} />
        <Route path="/admin/dnn/show-pipeline" element={<AdminShowPipeline />} />
        <Route path="/admin/dnn/daily-library" element={<AdminDailyNewsLibrary />} />
        <Route path="/admin/heygen-credits" element={<HeygenCreditMonitor />} />
        <Route path="/admin/production-dashboard" element={<AdminProductionDashboard />} />
        <Route path="/admin/compliance-review" element={<AdminComplianceReview />} />
        <Route path="/admin/qa-script-studio" element={<AdminQAScriptStudio />} />
        <Route path="/admin/shard2" element={<Shard2Dashboard />} />
        <Route path="/admin/shard2/pages" element={<Shard2Pages />} />
        <Route path="/admin/shard2/scripts" element={<Shard2Scripts />} />
        <Route path="/admin/shard2/library" element={<Shard2Library />} />
        <Route path="/admin/shard2/settings" element={<Shard2Settings />} />
      </Route>
      
      <Route path="/relo-management-video-bg" element={<ReloManagementVideoBg />} />
      <Route path="/agent-landing" element={<AgentLanding />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
          <Toaster />
          {new URLSearchParams(window.location.search).get('videoMode') !== 'true' && <PageNumberBadge />}
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
