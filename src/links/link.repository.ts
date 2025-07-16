import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../shared/utils/firebase';
import { Link, CreateLinkDto } from './link.model';

export class LinkRepository {
  private collection = adminDb.collection('users');

  private getUserLinksCollection(userId: string) {
    return this.collection.doc(userId).collection('links');
  }

  async create(userId: string, linkData: CreateLinkDto): Promise<Link> {
    const linksCollection = this.getUserLinksCollection(userId);
    const newLinkRef = linksCollection.doc();
    
    const link: Link = {
      id: newLinkRef.id,
      userId,
      ...linkData,
      active: true,
      clicks: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      order: linkData.order ?? 0, // Will be updated by service if not provided
    };

    await newLinkRef.set(link);
    return link;
  }

  async getHighestOrder(userId: string): Promise<number> {
    const linksCollection = this.getUserLinksCollection(userId);
    const snapshot = await linksCollection
      .orderBy('order', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return -1;
    }

    return snapshot.docs[0].data().order;
  }
} 