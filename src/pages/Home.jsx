import React from 'react';
import { base44 } from '@/api/localDatabase';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '@/components/home/HeroSection';
import NewsSection from '@/components/home/NewsSection';
import EventsSection from '@/components/home/EventsSection';
import GalleryPreview from '@/components/home/GalleryPreview';
import RaffleSection from '@/components/home/RaffleSection';
import InstagramFeed from '@/components/home/InstagramFeed';

export default function Home() {
    const { data: news, isLoading: loadingNews } = useQuery({
        queryKey: ['news-home'],
        queryFn: () => base44.entities.News.filter({ published: true }, '-created_date', 4),
        initialData: []
    });

    const { data: events, isLoading: loadingEvents } = useQuery({
        queryKey: ['events-home'],
        queryFn: () => base44.entities.Event.filter({ published: true, status: 'ativo' }, 'date', 3),
        initialData: []
    });

    const { data: photos, isLoading: loadingPhotos } = useQuery({
        queryKey: ['photos-home'],
        queryFn: () => base44.entities.Photo.filter({ published: true }, '-created_date', 8),
        initialData: []
    });

    const { data: raffles, isLoading: loadingRaffles } = useQuery({
        queryKey: ['raffles-home'],
        queryFn: () => base44.entities.Raffle.list('-draw_date', 3),
        initialData: []
    });

    return (
        <div className="min-h-screen bg-black">
            <HeroSection />
            <NewsSection news={news} isLoading={loadingNews} />
            <EventsSection events={events} isLoading={loadingEvents} />
            <GalleryPreview photos={photos} isLoading={loadingPhotos} />
            <RaffleSection raffles={raffles} isLoading={loadingRaffles} />
            <InstagramFeed />
        </div>
    );
}