import { LinkRepository } from './link.repository';
import { Link, CreateLinkDto, LinkResponse } from './link.model';

export class LinkService {
  constructor(private linkRepository: LinkRepository) {}

  async createLink(userId: string, linkData: CreateLinkDto): Promise<LinkResponse> {
    // If order not provided, get the highest order and add 1
    const isOrderProvided = linkData.order !== undefined;
    if (!isOrderProvided) {
      const lastOrder = await this.linkRepository.getHighestOrder(userId);
      linkData.order = (lastOrder ?? -1) + 1;
    }

    // Normalize URL if needed (you might want to add more validation)
    linkData.url = this.normalizeUrl(linkData.url);

    const link = await this.linkRepository.create(userId, linkData);

    // Transform to API response format
    return this.toLinkResponse(link);
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch (error) {
      // If URL is invalid, prepend https:// and try again
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return this.normalizeUrl(`https://${url}`);
      }
      throw new Error('Invalid URL provided');
    }
  }

  private toLinkResponse(link: Link): LinkResponse {
    return {
      id: link.id!,
      title: link.title,
      url: link.url,
      order: link.order,
      imageUrl: link.imageUrl,
      active: link.active,
      clicks: link.clicks,
      createdAt: link.createdAt.toDate().toISOString(),
      updatedAt: link.updatedAt.toDate().toISOString()
    };
  }
} 