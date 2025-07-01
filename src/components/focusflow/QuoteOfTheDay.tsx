
"use client";

import {useEffect,useState,useCallback} from 'react';
import {Card,CardContent,CardHeader,CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge,Flex} from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import {Quote as QuoteIcon,RefreshCw} from 'lucide-react';
import type {QuoteHubApiResponse} from '@/types';



export default function QuoteOfTheDay() {
  const [quoteData,setQuoteData]=useState<QuoteHubApiResponse|null>(null);
  const [isLoading,setIsLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  const fetchQuote=useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const API_URL='http://127.0.0.1:5000/quote';
    try {
      const response=await fetch(API_URL);
      if(!response.ok) {
        throw new Error(`Failed to fetch quote: ${response.status} ${response.statusText}`);
      }

      const rawData: any=await response.json();
      let quoteToProcess: any|null=null;

      if(Array.isArray(rawData)&&rawData.length>0) {
        quoteToProcess=rawData[0];
      } else if(rawData&&typeof rawData==='object'&&!Array.isArray(rawData)) {
        quoteToProcess=rawData;
      }

      let actualQuoteText='';
      let actualAuthorText='';
      let actualCategory: string|undefined=undefined;

      if(quoteToProcess&&typeof quoteToProcess==='object') {

        if(typeof quoteToProcess.quote==='string'&&quoteToProcess.quote.trim()!=='') {
          actualQuoteText=quoteToProcess.quote.trim();
        } else if(typeof quoteToProcess.text==='string'&&quoteToProcess.text.trim()!=='') {
          actualQuoteText=quoteToProcess.text.trim();
        }

        if(typeof quoteToProcess.author==='string'&&quoteToProcess.author.trim()!=='') {
          actualAuthorText=quoteToProcess.author.trim();
        }

        if(typeof quoteToProcess.category==='string') {
          actualCategory=quoteToProcess.category;
        }
      }

      if(actualQuoteText&&actualAuthorText) {
        setQuoteData({
          quote: actualQuoteText,
          author: actualAuthorText,
          tags: quoteToProcess.tags
        });
        setError(null);
      } else {
        console.warn("Unexpected API response structure, empty content, or not a valid quote object:",quoteToProcess,"Raw API data:",rawData);
        setError('No valid quote received from API.');
        setQuoteData(null);
      }
    } catch(err: any) {
      console.error("Error fetching quote:",err);
      setError(err.message&&err.message.startsWith('Failed to fetch')? err.message:'Could not load quote.');
      setQuoteData(null);
    } finally {
      setIsLoading(false);
    }
  },[]);

  useEffect(() => {
    fetchQuote();
  },[fetchQuote]);
  const tagColors={
    motivation: 'blue',
    inspiration: 'green',
    life: 'purple',
    success: 'yellow',
    wisdom: 'teal',
    love: 'pink',
  };
  return (
    <Card className="shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <QuoteIcon className="h-6 w-6 mr-2 text-primary" />
            <CardTitle className="font-headline text-2xl text-primary">
              Inspirational Quote
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchQuote}
            disabled={isLoading}
            aria-label="Refresh quote"
            className="text-muted-foreground hover:text-primary"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading? 'animate-spin':''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 min-h-[150px] flex flex-col justify-center items-center text-center">
        {isLoading&&<p className="text-muted-foreground">Loading quote...</p>}
        {error&&<p className="text-destructive">{error}</p>}
        {!isLoading&&!error&&quoteData&&(
          <figure>
            <blockquote className="text-lg italic text-foreground">
              "{quoteData.quote}"
            </blockquote>
            <figcaption className="text-right text-sm text-muted-foreground mt-3">
              — {quoteData.author}
            </figcaption>
            <figcaption className="text-left text-sm text-muted-foreground mt-3">
              <Flex gap="2" wrap="wrap">
                {quoteData.tags.map((tag,index) => (
                  <Badge
                    key={index}
                    color={tagColors[tag.toLowerCase()]||'indigo'}
                    variant="solid"
                    radius="large" style={{padding: '0.5rem'}}
                    className="mb-1 inline-flex gap-2 p-2 mr-2 cursor-pointer opacity-80 transition-opacity"
                  >
                    {tag}
                  </Badge>
                ))}
              </Flex>
            </figcaption>
          </figure>
        )}
        {!isLoading&&!error&&!quoteData&&(
          <p className="text-muted-foreground">{error||'No quote available. Try refreshing.'}</p>
        )}
      </CardContent>
    </Card>
  );
}
