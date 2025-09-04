import { NavigationHeader } from "@/components/navigation-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, CreditCard, Smartphone, CheckCircle, QrCode } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import pnbQrImage from "../assets/pnb.jpg";

export default function Donation() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const { toast } = useToast();

  const donationAmounts = [
    { amount: 100, label: "₹100", description: "Support our mission" },
    { amount: 500, label: "₹500", description: "Help spread wisdom" },
    { amount: 1000, label: "₹1000", description: "Fund development" },
    { amount: 2500, label: "₹2500", description: "Sponsor features" }
  ];

  const bankDetails = {
    accountName: "Shashank Karan",
    accountNumber: "3087001500090519",
    ifscCode: "PUNB0308700",
    bankName: "Punjab National Bank",
    branch: "Main Branch"
  };

  const upiId = "shashank.karan@pnb";
  const pnbUpiId = "shashank.karan@pnb";

  const handleDonate = (amount: number) => {
    setSelectedAmount(amount);
    setShowPaymentDetails(true);
  };

  const handleCustomDonate = () => {
    const amount = parseInt(customAmount);
    if (amount && amount > 0) {
      setSelectedAmount(amount);
      setShowPaymentDetails(true);
    } else {
      toast({
        title: "Please enter a valid amount",
        description: "Amount should be greater than 0",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleSubmitDonation = () => {
    toast({
      title: "Thank you for your donation!",
      description: "We will verify your payment and send you a confirmation email.",
    });
    
    // Reset form
    setSelectedAmount(null);
    setCustomAmount("");
    setShowPaymentDetails(false);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <NavigationHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-display">
            <span className="divine-text">Support Krishna Path</span>
          </h1>
          <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Help us continue sharing the timeless wisdom of the Bhagavad Gita with seekers around the world.
          </p>
        </div>


        {!showPaymentDetails ? (
          <Card className="glass-card rounded-3xl spiritual-shadow-medium">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-foreground font-display">Choose Your Contribution</CardTitle>
              <CardDescription className="text-muted-foreground">
                Every donation helps us continue our mission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {donationAmounts.map((item) => (
                  <Button
                    key={item.amount}
                    onClick={() => handleDonate(item.amount)}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center border-border hover:border-primary hover:bg-accent/50 transition-all duration-300 rounded-2xl hover:spiritual-shadow-soft"
                    data-testid={`donation-${item.amount}`}
                  >
                    <span className="text-xl font-bold text-foreground">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </Button>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <div className="w-full sm:flex-1 max-w-xs">
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="Enter custom amount (₹)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    data-testid="input-custom-amount"
                    className="text-center sm:text-left"
                  />
                </div>
                <Button
                  onClick={handleCustomDonate}
                  className="btn-sacred text-primary-foreground px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  data-testid="button-custom-donate"
                >
                  Donate
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Donation Amount Display */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 sm:px-6 sm:py-3 rounded-full">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-base sm:text-lg font-semibold">Donation Amount: ₹{selectedAmount}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              {/* Bank Transfer */}
              <Card className="glass-card rounded-2xl spiritual-shadow-soft">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Bank Transfer</h3>
                        <p className="text-sm text-muted-foreground">Transfer directly to our bank account</p>
                      </div>
                    </div>
                    <div className="space-y-2 lg:text-right">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-sm text-muted-foreground min-w-16">Account:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium break-all">{bankDetails.accountName}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(bankDetails.accountName, "Account name")}
                            className="h-6 w-6 p-0 flex-shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-sm text-muted-foreground min-w-16">Number:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium font-mono break-all">{bankDetails.accountNumber}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(bankDetails.accountNumber, "Account number")}
                            className="h-6 w-6 p-0 flex-shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-sm text-muted-foreground min-w-16">IFSC:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium font-mono">{bankDetails.ifscCode}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(bankDetails.ifscCode, "IFSC code")}
                            className="h-6 w-6 p-0 flex-shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* UPI Payment */}
              <Card className="glass-card rounded-2xl spiritual-shadow-soft">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">UPI Payment</h3>
                        <p className="text-sm text-muted-foreground">Pay instantly using UPI apps</p>
                      </div>
                    </div>
                    <div className="text-center lg:text-right">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center lg:justify-end gap-2 mb-2">
                        <span className="text-lg sm:text-xl font-bold text-foreground font-mono break-all">{upiId}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(upiId, "UPI ID")}
                          className="h-6 w-6 p-0 flex-shrink-0 mx-auto sm:mx-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Google Pay • PhonePe • Paytm • BHIM
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PNB QR Code Payment */}
              <Card className="glass-card rounded-2xl spiritual-shadow-soft">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <QrCode className="w-5 h-5 text-primary" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">PNB QR Pay</h3>
                          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-1 rounded font-bold text-xs">
                            PNB
                          </div>
                          <span className="text-xs text-muted-foreground">Accepted here</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Scan and Pay using PNB app</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* QR Code */}
                      <div 
                        className="bg-accent/30 rounded-lg p-2 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => setShowQrModal(true)}
                        data-testid="qr-code-preview"
                      >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg flex items-center justify-center border">
                          <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
                        </div>
                      </div>
                      {/* UPI ID */}
                      <div className="text-center">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <span className="text-sm sm:text-lg font-bold text-foreground font-mono break-all">{pnbUpiId}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(pnbUpiId, "PNB UPI ID")}
                            className="h-6 w-6 p-0 flex-shrink-0 mx-auto sm:mx-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Krishna Path Foundation</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDetails(false)}
                className="px-6 py-3 rounded-full w-full sm:w-auto max-w-xs"
                data-testid="button-back"
              >
                Back to Amount Selection
              </Button>
            </div>
          </div>
        )}

        <div className="text-center mt-8 text-sm text-muted-foreground px-4">
          <p className="break-words">🙏 Secure bank transfers, UPI and PNB payments • Your donation supports open-source spiritual technology 🕉️</p>
          {showPaymentDetails && (
            <div className="mt-4 p-3 sm:p-4 bg-accent/20 rounded-lg">
              <p className="text-xs sm:text-sm">After making the payment, we will verify your donation and send you a confirmation email within 24 hours.</p>
            </div>
          )}
        </div>
        
        {/* PNB QR Code Modal */}
        <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
          <DialogContent className="max-w-sm sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-center flex flex-col sm:flex-row items-center justify-center gap-2">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1 rounded font-bold text-sm">
                  PNB
                </div>
                <span>QR Code</span>
              </DialogTitle>
            </DialogHeader>
            <div className="text-center p-2 sm:p-4">
              <img 
                src={pnbQrImage} 
                alt="PNB QR Code for Krishna Path donation" 
                className="w-full max-w-[250px] sm:max-w-sm mx-auto rounded-lg shadow-lg"
              />
              <div className="mt-4 p-3 bg-accent/30 rounded-lg">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
                  <span className="text-base sm:text-lg font-bold text-foreground font-mono break-all">shashank.karan@pnb</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("shashank.karan@pnb", "PNB UPI ID")}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">SHASHANK KARAN</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}